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
  Chip,
  Link,
  // FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  useTheme,
  ButtonBase,
  Popper,
  InputBase
} from '@material-ui/core';
import * as Yup from 'yup';
// import { toast } from 'react-toastify';
import { Formik } from 'formik';
import { useParams, useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
// import TagsModal from 'src/components/tagsModal';
import { postAnnouncement, putAnnouncement } from 'src/services/announcementService';

import { getTagsAutocomplete } from 'src/services/tagsServices';
import { getResourceAutocomplete } from 'src/services/resourcesService';
import { getSynonymsAutocomplete } from 'src/services/synonymsService';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import SettingsIcon from '@material-ui/icons/Settings';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    fontSize: 13,
    borderRadius: 4,
    border: '1px solid #bbb',
    padding: 8,
    minHeight: 120
  },
  button: {
    fontSize: 13,
    width: '100%',
    textAlign: 'left',
    paddingBottom: 8,
    color: '#586069',
    fontWeight: 600,
    '&:hover,&:focus': {
      color: '#0366d6'
    },
    '& span': {
      width: '100%'
    },
    '& svg': {
      width: 16,
      height: 16
    }
  },
  tag: {
    padding: '.15em 4px',
    fontWeight: 600,
    lineHeight: '15px'
  },
  popper: {
    border: '1px solid rgba(27,31,35,.15)',
    boxShadow: '0 3px 12px rgba(27,31,35,.15)',
    borderRadius: 3,
    width: 300,
    zIndex: 1,
    fontSize: 13,
    color: '#586069',
    backgroundColor: '#f6f8fa'
  },
  header: {
    borderBottom: '1px solid #e1e4e8',
    padding: '8px 10px',
    fontWeight: 600
  },
  inputBase: {
    padding: 10,
    width: '100%',
    borderBottom: '1px solid #dfe2e5',
    '& input': {
      borderRadius: 4,
      backgroundColor: theme.palette.common.white,
      padding: 8,
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      border: '1px solid #ced4da',
      fontSize: 14,
      '&:focus': {
        borderColor: theme.palette.primary.main
      }
    }
  },
  paper: {
    boxShadow: 'none',
    margin: 0,
    color: '#586069',
    fontSize: 13
  },
  option: {
    minHeight: 'auto',
    alignItems: 'flex-start',
    padding: 8,
    '&[aria-selected="true"]': {
      backgroundColor: 'transparent'
    },
    '&[data-focus="true"]': {
      backgroundColor: theme.palette.action.hover
    }
  },
  popperDisablePortal: {
    position: 'relative'
  },
  iconSelected: {
    width: 17,
    height: 17,
    marginRight: 5,
    marginLeft: -2
  },
  color: {
    width: 14,
    height: 14,
    flexShrink: 0,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2
  },
  text: {
    flexGrow: 1
  },
  close: {
    opacity: 0.6,
    width: 18,
    height: 18
  }
}));

let STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2,
  LOADED: 3
};

let FILTER = createFilterOptions();

export const AutocompleteResourceByName = forwardRef(function ({ value: _value, tableProps }, parentRef) {
  if (tableProps) {
    _value = tableProps?.rowData?.tags;
  }

  const [value, setValue] = useState(_value || []);
  const [options, setOptions] = useState([]);
  const [stage, setSTAGE] = useState(STAGE.READY);
  const [open, setOpen] = useState(false);

  useImperativeHandle(parentRef, () => ({
    value
  }));

  async function autoComplete(input) {
    if (input.trim().length == 0) {
      setOptions([]);
      return;
    }
    setSTAGE(STAGE.LOADING);
    let { data } = await getResourceAutocomplete(input);
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
    }

    function evtFilterChange(options, params) {
      const filtered = FILTER(options, params);

      return filtered;
    }

    function evtAddNew(e) {
      e.preventDefault();
      e.stopPropagation();

      setValue([...value, dialogValue]);
      setOpen(false);
    }

    function evtCancle(e) {
      setOpen(false);
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
          loading={stage == STAGE.LOADING ? true : false}
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null) return false;
            return n.url == v.url ? true : false;
          }}
        />
      </>
    );
  }, [options, stage, value]);
});
