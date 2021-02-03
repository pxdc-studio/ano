import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { TextField, CircularProgress } from '@material-ui/core';
import { getResourceAutocomplete } from 'src/services/resourcesService';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

const STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2,
  LOADED: 3
};

const FILTER = createFilterOptions();

export const AutocompleteResourceByName = forwardRef(({ value: _value, tableProps, onChange }, parentRef) => {
  if (tableProps) {
    _value = tableProps?.rowData?.tags;
  }

  const [value, setValue] = useState(_value || []);
  const [options, setOptions] = useState([]);
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
    const { data } = await getResourceAutocomplete(input);
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
          label="Resources"
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

    // eslint-disable-next-line
    function evtInputChange(event, values) {
      if (onChange) {
        onChange(values);
      }
      setValue(values);
    }

    function evtFilterChange(_options, params) {
      const filtered = FILTER(_options, params);

      return filtered;
    }

    return (
      <>
        <Autocomplete
          value={value}
          multiple
          options={options}
          getOptionLabel={(option) => `${option.name} ${option.url ? `[ ${option.url} ]` : ''}`}
          filterSelectedOptions
          fullWidth
          loading={stage === STAGE.LOADING}
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            return n.url === v.url;
          }}
        />
      </>
    );
  }, [options, stage, value]);
});
