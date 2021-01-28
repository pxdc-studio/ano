/* eslint-disable */
import React, { useState } from 'react';
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
import { getTagsByName } from 'src/services/tagsServices';
// import { getAllResources, getSingleResource, deleteResource } from 'src/services/resourcesService';
import { getCurrentUser } from 'src/services/authService';
// import ResourcesModal from 'src/components/resourcesModal';
import AddIcon from '@material-ui/icons/Add';
// import AsyncSelect from 'react-select/async';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CheckCircle from '@material-ui/icons/CheckCircle';

/**
 * path: /app/add-announcements/new
 *      description: adds new announcement
 */

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

const STAGE = {
  READY: 0,
  SUCCESS: 1,
  LOADING: 2
};

const AnnouncementListView = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams(); // get params ID v.i.a hook
  const [stage, setStage] = useState(STAGE.READY);

  async function getAsyncTags(input) {
    const { status, data } = getTagsByName(input);
    console.log(data, status);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([{ value: 'abc', label: 'abc' }]);
      }, 1000);
    });
  }

  // Save and Update Announcement
  const _handleSubmit = async (values) => {
    return new Promise((r) => {
      setStage(STAGE.LOADING);
      setTimeout(() => {
        setStage(STAGE.SUCCESS);
        r();
      }, 10000);
    });
    // let a = await postAnnouncement(values);
    // console.log(a);
    // setStage(STAGE.SUCCESS);
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
          <Resources />
          <Tags />

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
    // status: Yup.number().required('Status is required'),
    // postdate: Yup.date().required('Post Date is required'),
    // tags: Yup.array().required('Tags are required')
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

export function Loading({ show }) {
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

export function Success({ show }) {
  const classes = useStyles();
  const navigate = useNavigate();

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

function Tags() {
  const [options] = React.useState([{ title: 'abc' }]);

  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={options}
      getOptionLabel={(option) => option.title}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField {...params} variant="outlined" label="Tags & Asynonyms" placeholder="Favorites" />
      )}
    />
  );
}

const filter = createFilterOptions();

function Resources() {
  const [value, setValue] = useState(null);
  const [open, toggleOpen] = useState(false);

  const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 }
  ];

  const handleClose = () => {
    setDialogValue({ title: '', year: '' });
    toggleOpen(false);
  };

  const [dialogValue, setDialogValue] = useState({ title: '', year: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    setValue({
      title: dialogValue.title,
      year: parseInt(dialogValue.year, 10)
    });

    handleClose();
  };

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            // timeout to avoid instant validation of the dialog's form.
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({ title: newValue, year: '' });
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              title: newValue.inputValue,
              year: ''
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (params.inputValue !== '') {
            filtered.push({
              inputValue: params.inputValue,
              title: `Add "${params.inputValue}"`
            });
          }

          return filtered;
        }}
        id="free-solo-dialog-demo"
        options={top100Films}
        getOptionLabel={(option) => {
          // e.g value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.title;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(option) => option.title}
        style={{ width: 300 }}
        freeSolo
        renderInput={(params) => <TextField {...params} label="Free solo dialog" variant="outlined" />}
      />
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <form onSubmit={handleSubmit}>
          <DialogTitle id="form-dialog-title">Add a new film</DialogTitle>
          <DialogContent>
            <DialogContentText>Did you miss any film in our list? Please, add it!</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.title}
              onChange={(event) => setDialogValue({ ...dialogValue, title: event.target.value })}
              label="title"
              type="text"
            />
            <TextField
              margin="dense"
              id="name"
              value={dialogValue.year}
              onChange={(event) => setDialogValue({ ...dialogValue, year: event.target.value })}
              label="year"
              type="number"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default AnnouncementListView;
