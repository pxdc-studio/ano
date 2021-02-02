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

import { getTagsAutocomplete } from 'src/services/tagsServices';
import { getResourceAutocomplete } from 'src/services/resourcesService';
import { getSynonymsAutocomplete } from 'src/services/synonymsService';

import AddIcon from '@material-ui/icons/Add';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CheckCircle from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(20)
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      outline: 'none'
    }
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    outline: 'none',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    borderRadius: '1em',
    '& > p > *': {
      verticalAlign: 'middle'
    }
  }
}));

let STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2,
  LOADED: 3
};

const AnnouncementListView = ({ onClose }) => {
  const classes = useStyles();
  const [stage, setStage] = useState(STAGE.READY);
  const resourceRef = useRef();
  const tagRef = useRef();
  const synonymRef = useRef();

  // Save and Update Announcement
  const _handleSubmit = async (values) => {
    setStage(STAGE.LOADING);

    let { status } = await postAnnouncement({
      title: values.title,
      message: values.message,
      tags: tagRef.current.value.map((r) => ({ slug: r.title })),
      resources: resourceRef.current.value.map((r) => ({ slug: r.title, url: r.url })),
      synonyms: synonymRef.current.value.map((r) => ({ slug: r.title }))
    });

    if (status === 200) {
      setStage(STAGE.SUCCESS);
    }
  };

  function Form({ errors, handleBlur, handleChange, handleSubmit, isSubmitting }) {
    return (
      <>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <Typography color="textPrimary" variant="h2">
              New Announcement
            </Typography>
          </Box>

          <TextField
            // eslint-disable-next-line no-unneeded-ternary
            error={errors.title != null}
            fullWidth
            label="Title"
            margin="normal"
            name="title"
            inputProps={{ maxLength: 80 }}
            onBlur={handleBlur}
            onChange={handleChange}
            variant="outlined"
          />

          <TextField
            // eslint-disable-next-line no-unneeded-ternary
            error={errors.message != null}
            fullWidth
            label="Message"
            margin="normal"
            required
            name="message"
            inputProps={{ maxLength: 280 }}
            multiline
            rowsMax={6}
            onBlur={handleBlur}
            onChange={handleChange}
            variant="outlined"
          />
          <Resources name="Resource" service={getResourceAutocomplete} ref={resourceRef} />
          <br />
          <Tags name="Tags" service={getTagsAutocomplete} ref={tagRef} />
          <br />
          <Synonyms name="Synonyms" service={getSynonymsAutocomplete} ref={synonymRef} />

          <Box my={4}>
            <Button
              color="primary"
              disabled={isSubmitting}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Box>
        </form>
      </>
    );
  }

  const validation = Yup.object().shape({
    title: Yup.string().max(80).required('Title is required'),
    message: Yup.string().max(280).required('Message is required')
  });

  return (
    <Page className={classes.root} title="Announcement">
      <Box display="flex" flexDirection="column" height="100%" justifyContent="center">
        <Container maxWidth="sm">
          <Success show={stage == STAGE.SUCCESS} onClose={onClose} />
          <Loading show={stage == STAGE.LOADING} />
          <Formik validationSchema={validation} onSubmit={_handleSubmit} initialValues={{}}>
            {Form}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

function Loading({ show }) {
  const classes = useStyles();

  return !show ? null : (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={show}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <CircularProgress disableShrink />
      </Modal>
    </div>
  );
}

function Success({ show, onClose }) {
  const classes = useStyles();

  return !show ? null : (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={show}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={show}>
          <div className={classes.paper}>
            <p>
              <CheckCircle color="primary" />
              <span>Post Success.</span>
            </p>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

let filter = createFilterOptions();

export const Resources = forwardRef(function ({ name, service = () => {}, value: _value = [] }, parentRef) {
  const [value, setValue] = useState(_value);
  const [options, setOptions] = useState([]);
  const [stage, setSTAGE] = useState(STAGE.READY);
  const [open, setOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState({
    title: '',
    url: ''
  });

  useImperativeHandle(parentRef, () => ({
    value
  }));

  async function autoComplete(input) {
    if (input.trim().length == 0) {
      setOptions([]);
      return;
    }
    setSTAGE(STAGE.LOADING);
    let { data } = await service(input);
    if (data && data.length > 0) {
      const formated_data_array = data.map((tag) => ({ title: tag.slug.split('-').join(' '), url: tag.url }));
      setOptions(formated_data_array);
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
      const newItem = values.find((item) => item.inputValue != null);

      if (newItem) {
        setOpen(true);
        setDialogValue({
          title: newItem.inputValue,
          url: ''
        });
        return;
      }

      setValue(values);
    }

    function evtFilterChange(options, params) {
      const filtered = filter(options, params);

      if (params.inputValue.trim() !== '') {
        filtered.push({
          inputValue: params.inputValue,
          title: `${params.inputValue}*`
        });
      }
      return filtered;
    }

    function evtAddNew(e) {
      e.preventDefault();
      e.stopPropagation();
      let exist = value.find((item) => item.url == dialogValue.url);
      if (exist) {
        setOpen(false);
        return;
      }

      setValue([...value, dialogValue]);
      setOpen(false);
    }

    return (
      <>
        <Autocomplete
          value={value}
          multiple
          options={options}
          getOptionLabel={(option) => option.title}
          filterSelectedOptions
          fullWidth
          loading={stage == STAGE.LOADING ? true : false}
          noOptionsText="> Type to load"
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null) return false;
            return n.url == v.url ? true : false;
          }}
        />
        <Dialog open={open} aria-labelledby="form-dialog-title">
          <form onSubmit={evtAddNew}>
            <DialogTitle>Add a new resource</DialogTitle>
            <DialogContent>
              <DialogContentText>Did you miss the Resource in the list? Please, add it!</DialogContentText>
              <TextField
                margin="dense"
                value={dialogValue.title}
                onChange={(event) => setDialogValue({ ...dialogValue, title: event.target.value })}
                label="title"
                type="text"
              />
              <TextField
                autoFocus
                margin="dense"
                value={dialogValue.url}
                onChange={(event) => setDialogValue({ ...dialogValue, url: event.target.value })}
                label="url"
                type="text"
              />
            </DialogContent>
            <DialogActions>
              <Button color="primary">Cancel</Button>
              <Button type="submit" color="primary">
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </>
    );
  }, [options, stage, value, open, dialogValue]);
});

export const Tags = forwardRef(function (
  { name, service = () => {}, value: _value = [], options: _options = [] },
  parentRef
) {
  let [value, setValue] = useState(_value);
  let [options, setOptions] = useState(_options);
  const [stage, setSTAGE] = useState(STAGE.READY);

  useImperativeHandle(parentRef, () => ({
    value,
    setOption: (o) => setOptions(o),
    setValue: (o) => setValue(o)
  }));

  async function autoComplete(input) {
    if (input.trim().length == 0) {
      setOptions([]);
      return;
    }
    setSTAGE(STAGE.LOADING);
    let { data } = await service(input);
    if (data && data.length > 0) {
      const formated_data_array = data.map((tag) => ({ title: tag.slug.split('-').join(' ') }));
      setOptions(formated_data_array);
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
      const filtered = filter(options, params);

      if (params.inputValue.trim() !== '') {
        filtered.push({
          slug: params.inputValue,
          title: `${params.inputValue}*`
        });
      }
      return filtered;
    }

    return (
      <>
        <Autocomplete
          value={value}
          multiple
          options={options}
          getOptionLabel={(option) => option.title}
          filterSelectedOptions
          fullWidth
          loading={stage == STAGE.LOADING ? true : false}
          noOptionsText="> Type to load"
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          filterOptions={evtFilterChange}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null) return false;
            return n.slug == v.slug ? true : false;
          }}
        />
      </>
    );
  }, [options, stage, value]);
});

export const Synonyms = forwardRef(function ({ name, service = () => {}, value: _value = [] }, parentRef) {
  const [value, setValue] = useState(_value);
  const [options, setOptions] = useState([]);
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
    let { data } = await service(input);

    if (data && data.length > 0) {
      const formated_data_array = data.map((tag) => ({ title: tag.slug.split('-').join(' '), synonyms: tag.synonyms }));
      setOptions(formated_data_array);
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

    return (
      <>
        <Autocomplete
          value={value}
          multiple
          options={options}
          getOptionLabel={(option) => {
            let message = `${option.title}`;
            if (option.synonyms != null && option.synonyms.length > 0) {
              message += `(${option.synonyms.map((tag) => tag.slug).join(', ')}})`;
            }
            return message;
          }}
          filterSelectedOptions
          fullWidth
          loading={stage == STAGE.LOADING ? true : false}
          noOptionsText="> Type to load"
          freeSolo
          onChange={evtInputChange}
          renderInput={Input}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null) return false;
            return n.slug == v.slug ? true : false;
          }}
        />
      </>
    );
  }, [options, stage, value]);
});

export function ModalAddAnnouncement({ show, onClose }) {
  const classes = useStyles();

  return !show ? null : (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={show}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={show}>
        <div className={classes.paper}>
          <AnnouncementListView onClose={onClose} />
        </div>
      </Fade>
    </Modal>
  );
}

export default AnnouncementListView;
