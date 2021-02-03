import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Chip, TextField, CircularProgress } from '@material-ui/core';
import TagIcon from '@material-ui/icons/Bookmark';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { getTagsAutocomplete } from 'src/services/tagsServices';

const STAGE = {
  LOADING: 0,
  READY: 1
};

const FILTER = createFilterOptions();

export const AutocompleteByTagName = forwardRef(
  ({ value: _value, options: _options, tableProps, creatable = true, onChange }, parentRef) => {
    if (tableProps) {
      _value = tableProps?.rowData?.tags;
    }
    const [value, setValue] = useState(_value || []);
    const [options, setOptions] = useState(_options || []);
    const [stage, setSTAGE] = useState(STAGE.READY);

    useImperativeHandle(parentRef, () => ({
      value
    }));

    async function autoComplete(input) {
      if (input.trim().length === 0) {
        setOptions([]);
        return;
      }

      setSTAGE(STAGE.LOADING);
      const { data } = await getTagsAutocomplete(input);
      if (data && data.length > 0) {
        setOptions(data);
      }

      setSTAGE(STAGE.READY);
    }

    return useMemo(() => {
      function Input(params) {
        return (
          <TextField
            {...params}
            onChange={(e) => autoComplete(e.target.value)}
            label="Find Tags"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {stage === STAGE.LOADING ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        );
      }

      function evtInputChange(event, values) {
        setValue(values);
        if (onChange) {
          onChange(values);
        }
        if (tableProps?.onRowDataChange) {
          tableProps.onRowDataChange({ ...tableProps.rowData, tags: values });
        }
      }

      function evtFilterChange(entries, params) {
        const filtered = FILTER(entries, params);
        //allow create new tag ?
        if (!creatable) {
          const existingOptions = entries.map((item) => item.name);
          const existingValues = value.map((item) => item.name);
          const input = params.inputValue.trim();
          if (input !== '' && !existingOptions.includes(input) && !existingValues.includes(input)) {
            filtered.push({
              name: input
            });
          }
        }

        return filtered;
      }
      return (
        <>
          <Autocomplete
            value={value}
            multiple
            options={options}
            getOptionLabel={(option) => option.name}
            filterSelectedOptions
            fullWidth
            loading={stage === STAGE.LOADING}
            freeSolo
            onChange={evtInputChange}
            renderInput={Input}
            filterOptions={evtFilterChange}
            getOptionSelected={(v, n) => {
              if (v.inputValue !== null && n.name !== v.inputValue && n.name !== v.name) return false;
              return n.name === v.name;
            }}
            renderOption={(p) => {
              return <Chip icon={<TagIcon />} size="small" label={p.name} />;
            }}
            renderTags={(row) => {
              return row
                ? row.map((item) => (
                    <Chip key={item.name} icon={<TagIcon />} size="small" label={item.name} style={{ margin: 2 }} />
                  ))
                : '';
            }}
          />
        </>
      );
    }, [options, stage, value]);
  }
);
