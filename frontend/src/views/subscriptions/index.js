/* eslint-disable */
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  Box,
  Container,
  makeStyles,
  Button,
  TextField,
  Chip,
  Avatar,
  Popover,
  Typography,
  CircularProgress
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Page from 'src/components/Page';
import { toast } from 'react-toastify';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { bindPopover } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';

import { Formik } from 'formik';
import AddIcon from '@material-ui/icons/Add';
import { getAuthorsAutocomplete } from 'src/services/authorService';
import { getTagsAutocomplete } from 'src/services/tagsServices';
import { getSynonymsAutocomplete } from 'src/services/synonymsService';
import { postSubscription, getAllSubscriptions } from 'src/services/subscriptionService';
import { Authors } from './author.autocomplete';

/**
 * path: /app/subscriptions
 *      description: subscriptions CRUD
 */
const STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2,
  LOADED: 3
};
// Styles for root component
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(20)
  }
}));
// MUI Theme Provider for using custom fonts
const themeTable = createMuiTheme({
  palette: {
    primary: {
      main: '#3f51b5'
    },
    secondary: {
      main: '#3f51b5'
    }
  },
  typography: {
    fontFamily: [
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(',')
  }
});

export default function () {
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [synonyms, setSynonyms] = useState([]);

  const [loader, setLoader] = useState(false);
  const [selected, setSelected] = useState(null);
  // eslint-disable-next-line no-unused-vars

  const popupState = usePopupState({
    variant: 'popper',
    popupId: 'sub-popover'
  });

  const tagRef = useRef();
  const authorRef = useRef();
  const synonymRef = useRef();

  function onSingleTagUpdate(value) {
    const tag = tags.find((tag) => {
      if (tag.tag) return tag.tag.id == value.id;
      else return tag.id == value.id;
    });
    tag.exclude_authors = value.exclude_authors;
    setTags(tags);
  }

  function onEveryTagsUpdate(value) {
    setTags(value);
  }

  useEffect(() => {
    async function fetchAllSubscriptions() {
      try {
        const { status, data } = await getAllSubscriptions();
        if (status === 200) {
          //due to sql response, id is normalized to tag_id, not joined id
          setTags(data.tags.map((item) => ({ ...item, id: item.tag.id })));
          setSynonyms(data.synonyms.map((item) => ({ ...item, id: item.synonym.id })));
          setAuthors(data.authors.map((item) => ({ ...item, id: item.author.id })));
          setLoader(false);
        }
      } catch (ex) {
        toast.error(ex.response.data.message);
        setLoader(false);
      }
    }

    fetchAllSubscriptions();
  }, []);

  async function _handleSubmit(e) {
    setLoader(true);

    await postSubscription({
      tags: tags,
      authors: authorRef.current.value,
      synonyms: synonymRef.current.value
    });
    setLoader(false);
  }

  return (
    <Page className={classes.root} title="Subcriptions">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <Formik onSubmit={_handleSubmit} initialValues={{}}>
              {function Form({ errors, handleBlur, handleChange, handleSubmit }) {
                return (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Box mb={3}>
                        <Typography color="textPrimary" variant="h2">
                          Subscription
                        </Typography>
                      </Box>

                      <br />

                      <TagsBox
                        name="Tags"
                        service={getTagsAutocomplete}
                        ref={tagRef}
                        value={tags}
                        popupState={popupState}
                        onSelect={(option) => setSelected(option)}
                        onEveryTagsUpdate={onEveryTagsUpdate}
                      />
                      <br />

                      <SynonymsBox
                        name="Synonyms"
                        service={getSynonymsAutocomplete}
                        ref={synonymRef}
                        value={synonyms}
                      />

                      <br />
                      <AuthorsBox name="Authors" service={getAuthorsAutocomplete} ref={authorRef} value={authors} />
                      <Box my={4}>
                        <Button
                          color="primary"
                          disabled={loader}
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                          startIcon={<AddIcon />}
                        >
                          Update
                        </Button>
                      </Box>
                    </form>
                  </>
                );
              }}
            </Formik>
          </MuiThemeProvider>
        </Box>
        <Popover
          {...bindPopover(popupState)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <Box p={2} minWidth={320}>
            <Authors
              name="Excluded Authors"
              service={getAuthorsAutocomplete}
              ref={authorRef}
              data={selected}
              onChange={onSingleTagUpdate}
            />
          </Box>
        </Popover>
      </Container>
    </Page>
  );
}

const filter = createFilterOptions();

export const TagsBox = forwardRef(
  (
    {
      name,
      service = () => {},
      value: _value,
      options: _options,
      popupState,
      onSelect = () => {},
      onEveryTagsUpdate = () => {}
    },
    parentRef
  ) => {
    let [value, setValue] = useState(_value || []);
    let [options, setOptions] = useState(_options || []);
    const [selected, setSelected] = useState(null);
    const [stage, setSTAGE] = useState(STAGE.READY);

    useImperativeHandle(parentRef, () => ({
      value
    }));

    useEffect(() => {
      if ((_value != null || (_value && _value.length < 1)) && _value != value) {
        let mapped = _value.map((tag) => ({
          title: tag.tag.slug,
          exclude_authors: tag.exclude_authors,
          id: tag.tag.id
        }));
        setValue(mapped);
      }
    }, [_value]);

    useEffect(() => {
      if ((_options != null || (_options && _options.length < 1)) && _options != options) {
        let mapped = _value.map((tag) => ({
          title: tag.tag.slug,
          exclude_authors: tag.exclude_authors,
          id: tag.tag.id
        }));
        setOptions(mapped);
      }
    }, [_options]);

    async function autoComplete(input) {
      if (input.trim().length == 0) {
        setOptions([]);
        return;
      }

      setSTAGE(STAGE.LOADING);

      let { data } = await service(input);
      if (data && data.length > 0) {
        const formated_data_array = data.map((tag) => ({
          title: tag.slug.split('-').join(' '),
          id: tag.id
        }));
        setOptions(formated_data_array);
      }
      setSTAGE(STAGE.READY);
    }

    function evtInputChange(event, values) {
      setValue(values);
      onEveryTagsUpdate(values);
    }

    return useMemo(() => {
      function Input(params) {
        return (
          <TextField
            {...params}
            onChange={(e) => autoComplete(e.target.value)}
            label={name}
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

      function evtFilterChange(options, params) {
        return filter(options, params);
      }

      return (
        <>
          <Autocomplete
            value={value}
            options={options}
            multiple
            getOptionLabel={(option) => option.title}
            filterSelectedOptions
            fullWidth
            loading={stage == STAGE.LOADING ? true : false}
            noOptionsText="> Enter to autocomplete tags"
            onChange={evtInputChange}
            renderInput={Input}
            filterOptions={evtFilterChange}
            getOptionSelected={(v, n) => {
              if (v.inputValue != null) return false;
              return n.title == v.title ? true : false;
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                return (
                  <Chip
                    data-index={index}
                    size="small"
                    // avatar={<Avatar>M</Avatar>}
                    label={option.title}
                    style={{
                      background: option.exclude_authors && option.exclude_authors.length > 0 ? 'crimson' : '#eee'
                    }}
                    {...getTagProps({ index })}
                    onClick={(e) => {
                      onSelect(option);
                      popupState.close();
                      popupState.open(e.target);
                    }}
                  />
                );
              })
            }
          />
        </>
      );
    }, [_options, stage, value]);
  }
);

export const SynonymsBox = forwardRef(
  (
    { name, service = () => {}, value: _value, options: _options, onSelect = () => {}, onEveryTagsUpdate = () => {} },
    parentRef
  ) => {
    let [value, setValue] = useState(_value || []);
    let [options, setOptions] = useState(_options || []);
    const [selected, setSelected] = useState(null);
    const [stage, setSTAGE] = useState(STAGE.READY);

    useImperativeHandle(parentRef, () => ({
      value
    }));

    useEffect(() => {
      if ((_value != null || (_value && _value.length < 1)) && _value != value) {
        let mapped = _value.map((data) => ({
          title: data.synonym.slug,
          exclude_authors: data.exclude_authors,
          id: data.synonym.id
        }));
        setValue(mapped);
      }
    }, [_value]);

    useEffect(() => {
      if ((_options != null || (_options && _options.length < 1)) && _options != options) {
        let mapped = _value.map((synonym) => ({
          title: synonym.synonym.slug,
          exclude_authors: synonym.exclude_authors,
          id: data.synonym.id
        }));
        setOptions(mapped);
      }
    }, [_options]);

    async function autoComplete(input) {
      if (input.trim().length == 0) {
        setOptions([]);
        return;
      }

      setSTAGE(STAGE.LOADING);

      let { data } = await service(input);
      if (data && data.length > 0) {
        const formated_data_array = data.map((data) => ({ title: data.slug.split('-').join(' '), id: data.id }));
        setOptions(formated_data_array);
      }
      setSTAGE(STAGE.READY);
    }

    function evtInputChange(event, values) {
      setValue(values);
      onEveryTagsUpdate(values);
    }

    return useMemo(() => {
      function Input(params) {
        return (
          <TextField
            {...params}
            onChange={(e) => autoComplete(e.target.value)}
            label={name}
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

      function evtFilterChange(options, params) {
        return filter(options, params);
      }

      return (
        <>
          <Autocomplete
            value={value}
            options={options}
            multiple
            getOptionLabel={(option) => option.title}
            filterSelectedOptions
            fullWidth
            loading={stage == STAGE.LOADING ? true : false}
            noOptionsText="> Enter to autocomplete tags"
            onChange={evtInputChange}
            renderInput={Input}
            filterOptions={evtFilterChange}
            getOptionSelected={(v, n) => {
              if (v.inputValue != null) return false;
              return n.title == v.title ? true : false;
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                return (
                  <Chip
                    data-index={index}
                    size="small"
                    // avatar={<Avatar>M</Avatar>}
                    label={option.title}
                    style={{
                      background: option.exclude_authors && option.exclude_authors.length > 0 ? 'crimson' : '#eee'
                    }}
                    {...getTagProps({ index })}
                  />
                );
              })
            }
          />
        </>
      );
    }, [_options, stage, value]);
  }
);

export const AuthorsBox = forwardRef(
  (
    { name, service = () => {}, value: _value, options: _options, onSelect = () => {}, onEveryTagsUpdate = () => {} },
    parentRef
  ) => {
    let [value, setValue] = useState(_value || []);
    let [options, setOptions] = useState(_options || []);
    const [selected, setSelected] = useState(null);
    const [stage, setSTAGE] = useState(STAGE.READY);
    useImperativeHandle(parentRef, () => ({
      value
    }));

    useEffect(() => {
      if ((_value != null || (_value && _value.length < 1)) && _value != value) {
        let mapped = _value.map((data) => ({
          username: data.author.username,
          title: data.author.username,
          exclude_tags: data.exclude_tags,
          id: data.author.id
        }));
        setValue(mapped);
      }
    }, [_value]);

    useEffect(() => {
      if ((_options != null || (_options && _options.length < 1)) && _options != options) {
        let mapped = _value.map((data) => ({
          username: data.author.username,
          title: data.author.username,
          exclude_tags: data.exclude_tags,
          id: data.author.id
        }));
        setOptions(mapped);
      }
    }, [_options]);

    async function autoComplete(input) {
      if (input.trim().length == 0) {
        setOptions([]);
        return;
      }

      setSTAGE(STAGE.LOADING);

      let { data } = await service(input);
      if (data && data.length > 0) {
        data = data.map((d) => {
          d.title = d.username;
          return d;
        });
        setOptions(data);
      }
      setSTAGE(STAGE.READY);
    }

    function evtInputChange(event, values) {
      setValue(values);
      onEveryTagsUpdate(values);
    }

    return useMemo(() => {
      function Input(params) {
        return (
          <TextField
            {...params}
            onChange={(e) => autoComplete(e.target.value)}
            label={name}
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

      function evtFilterChange(options, params) {
        return filter(options, params);
      }

      return (
        <>
          <Autocomplete
            value={value}
            options={options}
            multiple
            getOptionLabel={(option) => option.username}
            filterSelectedOptions
            fullWidth
            loading={stage == STAGE.LOADING ? true : false}
            noOptionsText="> Enter to autocomplete tags"
            onChange={evtInputChange}
            renderInput={Input}
            filterOptions={evtFilterChange}
            getOptionSelected={(v, n) => {
              if (v.inputValue != null) return false;
              return n.title == v.title ? true : false;
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                return (
                  <Chip
                    data-index={index}
                    size="small"
                    avatar={
                      <Avatar>
                        <>{option.title && option.title.substring(0, 1).toUpperCase()}</>
                      </Avatar>
                    }
                    label={option.title}
                    style={{
                      background: option.exclude_authors && option.exclude_authors.length > 0 ? 'crimson' : '#eee'
                    }}
                    {...getTagProps({ index })}
                  />
                );
              })
            }
          />
        </>
      );
    }, [_options, stage, value]);
  }
);
