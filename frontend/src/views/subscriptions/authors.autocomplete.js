/* eslint-disable */

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Box, Chip, Container, makeStyles, TextField, CircularProgress } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllSynonyms, deleteSynonym, postSynonym, putSynonyms } from 'src/services/synonymsService';
import FaceIcon from '@material-ui/icons/Face';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

import { getAuthorsAutocomplete } from 'src/services/authorService';

const STAGE = {
  LOADING: 0,
  READY: 1
};

const FILTER = createFilterOptions();

export const AutocompleteByAuthor = forwardRef(function (
  { name, value: _value, options: _options, tableProps, onChange },
  parentRef
) {
  if (tableProps) {
    _value = tableProps?.rowData?.tags;
  }
  let [value, setValue] = useState(_value || []);
  let [options, setOptions] = useState(_options || []);
  const [stage, setSTAGE] = useState(STAGE.READY);

  useImperativeHandle(parentRef, () => ({
    value
  }));

  async function autoComplete(input) {
    if (input.trim().length == 0) {
      setOptions([]);
      return;
    }

    setSTAGE(STAGE.LOADING);
    let { data } = await getAuthorsAutocomplete(input);
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
          label="Find Author"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {stage == STAGE.LOADING ? <CircularProgress color="inherit" size={20} /> : null}
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

    function evtFilterChange(options, params) {
      const filtered = FILTER(options, params);
      return filtered;
    }
    return (
      <>
        <Autocomplete
          value={value}
          multiple
          options={options}
          getOptionLabel={(option) => option.username}
          filterSelectedOptions
          fullWidth
          loading={stage == STAGE.LOADING ? true : false}
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null && n.username != v.inputValue) return false;
            return n.username == v.username ? true : false;
          }}
          renderOption={(p) => {
            return <Chip icon={<FaceIcon />} size="small" label={p.username} />;
          }}
          renderTags={(row) => {
            return row
              ? row.map((item) => (
                  <Chip
                    key={item.username}
                    icon={<FaceIcon />}
                    size="small"
                    label={item.username}
                    style={{ margin: 2 }}
                  />
                ))
              : '';
          }}
        />
      </>
    );
  }, [options, stage, value]);
});
