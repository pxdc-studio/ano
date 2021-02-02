/* eslint-disable */
import React, { useContext, useEffect, useState, useMemo, forwardRef, useRef, useImperativeHandle } from 'react';
import {
  Box,
  Container,
  makeStyles,
  TextField,
  Typography,
  Button,
  // Select,
  // MenuItem,
  // FormControl,
  // InputLabel,
  // Chip,
  // FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Modal,
  Fade,
  Backdrop
} from '@material-ui/core';
import * as Yup from 'yup';
// import { toast } from 'react-toastify';
import { Formik } from 'formik';
import { useParams, useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
// import TagsModal from 'src/components/tagsModal';
import { postAnnouncement, putAnnouncement } from 'src/services/announcementService';

import AddIcon from '@material-ui/icons/Add';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CheckCircle from '@material-ui/icons/CheckCircle';

let STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2,
  LOADED: 3
};

let filter = createFilterOptions();

export const Authors = forwardRef(function (
  { name, service = () => {}, value: _value = [], data, onChange = () => {} },
  parentRef
) {
  const [value, setValue] = useState(_value);
  const [options, setOptions] = useState([]);
  const [stage, setSTAGE] = useState(STAGE.READY);

  useImperativeHandle(parentRef, () => ({
    value
  }));

  useEffect(() => {
    if (data && data.exclude_authors) {
      setValue(data.exclude_authors);
    }
  }, [data]);

  async function autoComplete(input) {
    if (input.trim().length == 0) {
      setOptions([]);
      return;
    }
    setSTAGE(STAGE.LOADING);
    let { data } = await service(input);
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
          label={name}
          variant="outlined"
          autoFocus={true}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {stage == STAGE.LOADING ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
          onClick={(e) => {
            e.target.focus();
          }}
        />
      );
    }

    function evtInputChange(event, values) {
      data.exclude_authors = values;
      setValue(values);
      onChange(data);
    }

    function evtFilterChange(options, params) {
      return filter(options, params);
    }

    return (
      <>
        <Autocomplete
          value={value}
          multiple
          options={options}
          getOptionLabel={(option) => `${option.username}`}
          filterSelectedOptions
          fullWidth
          loading={stage == STAGE.LOADING ? true : false}
          noOptionsText="> Type to load"
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null) return false;
            return n.username == v.username ? true : false;
          }}
        />
      </>
    );
  }, [options, stage, value]);
});
