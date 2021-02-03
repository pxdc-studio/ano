import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { TextField, CircularProgress, Chip } from '@material-ui/core';
import TagsIcon from '@material-ui/icons/Bookmarks';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { getSynonymsAutocomplete } from 'src/services/synonymsService';

const STAGE = {
  LOADING: 0,
  READY: 1
};

const FILTER = createFilterOptions();

export const AutocompleteSynonymByName = forwardRef(
  ({ value: _value, options: _options, tableProps, onChange }, parentRef) => {
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
      const { data } = await getSynonymsAutocomplete(input);
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
            label="Find Synonym"
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

      ///eslint-disable-next-line
      function evtInputChange(event, values) {
        if (onChange) {
          onChange(values);
        }
        setValue(values);
        if (tableProps?.onRowDataChange) {
          tableProps.onRowDataChange({ ...tableProps.rowData, tags: values });
        }
      }

      function evtFilterChange(entries, params) {
        const filtered = FILTER(entries, params);
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
              return n.name === v.name;
            }}
            renderOption={(p) => {
              return <Chip icon={<TagsIcon />} size="small" label={p.name} />;
            }}
            renderTags={(row) => {
              return row
                ? row.map((item) => (
                    <Chip key={item.name} icon={<TagsIcon />} size="small" label={item.name} style={{ margin: 2 }} />
                  ))
                : '';
            }}
          />
        </>
      );
    }, [options, stage, value]);
  }
);
