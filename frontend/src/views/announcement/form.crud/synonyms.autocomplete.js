/* eslint-disable */

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Box, Chip, Container, makeStyles, TextField, CircularProgress } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllSynonyms, deleteSynonym, postSynonym, putSynonyms } from 'src/services/synonymsService';
import TagsIcon from '@material-ui/icons/Bookmarks';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

import { getSynonymsAutocomplete } from 'src/services/synonymsService';

const STAGE = {
  LOADING: 0,
  READY: 1
};

const FILTER = createFilterOptions();

export const Synonyms = forwardRef(function ({ name, value: _value, options: _options, tableProps }, parentRef) {
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
    let { data } = await getSynonymsAutocomplete(input);
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
          getOptionLabel={(option) => option.name}
          filterSelectedOptions
          fullWidth
          loading={stage == STAGE.LOADING ? true : false}
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null && n.name != v.inputValue) return false;
            return n.name == v.name ? true : false;
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
});