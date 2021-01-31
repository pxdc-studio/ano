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

import AddIcon from '@material-ui/icons/Add';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CheckCircle from '@material-ui/icons/CheckCircle';

import { StageContext } from '../context';

const TITLE_LIMIT = 80;
const MESSAGE_LIMIT = 280;

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

const AnnouncementListView = () => {
  const classes = useStyles();
  // const navigate = useNavigate();
  const [stage, setStage] = useState(STAGE.READY);
  const resourceRef = useRef();
  const tagRef = useRef();

  // Save and Update Announcement
  const _handleSubmit = async (values) => {
    setStage(STAGE.LOADING);
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
          <Resources name="Tags" service={getTagsAutocomplete} ref={tagRef} />

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
          <Success show={stage == STAGE.SUCCESS} />
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

function Success({ show }) {
  const classes = useStyles();
  const navigate = useNavigate();

  // const [stage, setStage] = useContext(StageContext);

  useEffect(() => {
    let timeout;

    if (show) {
      timeout = setTimeout(() => {
        // setStage(1);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [show]);

  function evtClose() {
    navigate(`/announcements`, { replace: true });
  }

  return !show ? null : (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={show}
        onClose={evtClose}
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

let STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2,
  LOADED: 3
};

let filter = createFilterOptions();

export const Resources = forwardRef(function ({ name, service = () => {} }, parentRef) {
  const [value, setValue] = useState([]);
  const [options, setOptions] = useState([]);
  const [stage, setSTAGE] = useState(STAGE.READY);
  let [input, setInput] = useState(null);
  let [open, setOpen] = useState(false);
  const [dialogValue, setDialogValue] = React.useState({
    title: '',
    url: ''
  });

  useImperativeHandle(parentRef, () => ({
    value
  }));

  function loadData(input) {
    if (input != null && input.length > 0) {
      setSTAGE(STAGE.LOADING);
      setInput(input);
    }

    if (input && input.trim() == '') {
      setSTAGE(STAGE.READY);
    }
  }

  useEffect(() => {
    if (input != null && input.length > 0) {
      try {
        (async () => {
          let { data } = await service(input);
          if (data && data.length > 0) {
            const formated_data_array = data.map((tag) => ({ title: tag.slug.split('-').join(' '), url: tag.url }));
            setOptions(formated_data_array);
            setSTAGE(STAGE.LOADED);
          } else {
            setOptions([]);
            setSTAGE(STAGE.LOADED);
          }
        })();
      } catch (e) {
        setSTAGE(STAGE.READY);
      }
    }
  }, [input]);

  return useMemo(() => {
    function Input(params) {
      return (
        <TextField
          {...params}
          onChange={(e) => loadData(e.target.value)}
          label={name}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {stage == STAGE.LOADING ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      );
    }

    function evtTagChange(event, newValue) {
      if (newValue.length < 1) return;
      const newItem = newValue.find((item) => item.inputValue != null);
      if (newItem) {
        setOpen(true);
        setDialogValue({
          title: newItem.inputValue,
          url: ''
        });
      } else {
        setValue(newValue);
      }
    }

    function evtOptionFilter(options, params) {
      const filtered = filter(options, params);

      if (params.inputValue !== '') {
        filtered.push({
          inputValue: params.inputValue,
          title: `${params.inputValue} (*)`
        });
      }
      return filtered;
    }

    function evtNewResource(e) {
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
          onChange={evtTagChange}
          renderInput={Input}
          filterOptions={evtOptionFilter}
          getOptionSelected={(v, n) => {
            if (v.inputValue != null) return false;
            return n.url == v.url ? true : false;
          }}
        />
        <Dialog open={open} aria-labelledby="form-dialog-title">
          <form onSubmit={evtNewResource}>
            <DialogTitle>Add a new resource</DialogTitle>
            <DialogContent>
              <DialogContentText>Did you miss the {name} in the list? Please, add it!</DialogContentText>
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

export function ModalAddAnnouncement({ show }) {
  const [stage, setStage] = useContext(StageContext);

  const classes = useStyles();
  // const navigate = useNavigate();

  function evtClose() {
    // navigate(`/announcements`, { replace: true });

    setStage(STAGE.READY);
  }

  return !show ? null : (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={show}
      onClose={evtClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={show}>
        <div className={classes.paper}>
          <AnnouncementListView />
        </div>
      </Fade>
    </Modal>
  );
}

export default AnnouncementListView;
