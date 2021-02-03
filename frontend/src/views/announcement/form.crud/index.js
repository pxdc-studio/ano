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
  withStyles,
  Grid,
  Switch,
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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Page from 'src/components/Page';
// import TagsModal from 'src/components/tagsModal';
import { postAnnouncement, putAnnouncement } from 'src/services/announcementService';

import { getTagsAutocomplete } from 'src/services/tagsServices';
import { getResourceAutocomplete } from 'src/services/resourcesService';
import { getSynonymsAutocomplete } from 'src/services/synonymsService';

import AddIcon from '@material-ui/icons/Add';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CheckCircle from '@material-ui/icons/CheckCircle';

import { AutocompleteByTagName } from './tags.autocomplete';
import R, { AutocompleteResourceByName } from './resources.autocomplete';
import { Synonyms } from './synonyms.autocomplete';
import { toast } from 'react-toastify';

export { AutocompleteResourceByName as Resources, Synonyms, AutocompleteByTagName as Tags };

const AntSwitch = withStyles((theme) => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex'
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main
      }
    }
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none'
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white
  },
  checked: {}
}))(Switch);

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

const AnnouncementListView = ({ action }) => {
  const { state: _state } = useLocation();
  const [state, setState] = useState(_state || {});
  const classes = useStyles();
  const [stage, setStage] = useState(STAGE.READY);
  const resourceRef = useRef();
  const tagRef = useRef();
  const synonymRef = useRef();

  let navigate = useNavigate();

  // Save and Update Announcement
  const _handleSubmit = async (values) => {
    try {
      setStage(STAGE.LOADING);
      let payload = {
        id: state.id,
        title: values.title,
        message: values.message,
        tags: tagRef.current.value,
        resources: resourceRef.current.value,
        synonyms: synonymRef.current.value,
        status: state.status
      };

      let { data } = action == 'update' ? await putAnnouncement(payload) : await postAnnouncement(payload);

      const { status, message } = data;

      if (status === 200) {
        toast.success(message);
        navigate('/announcements/me');
      } else {
        toast.error(message);
      }
    } catch (e) {
      console.log(e);
      toast.error('Server Error');
    }
  };

  function Form({ errors, handleBlur, handleChange, handleSubmit, isSubmitting }) {
    return (
      <>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <Typography color="textPrimary" variant="h2">
              {action == 'update' ? 'Update' : 'New'} Announcement
            </Typography>
          </Box>

          <TextField
            // eslint-disable-next-line no-unneeded-ternary

            defaultValue={state.title}
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
            defaultValue={state.message}
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
          <AutocompleteResourceByName ref={resourceRef} value={state.resources} />
          <br />
          <AutocompleteByTagName ref={tagRef} value={state.tags} />
          <br />
          <Synonyms name="Synonyms" ref={synonymRef} value={state.synonyms} />
          {action == 'update' && (
            <Typography component="div" style={{ marginTop: 16 }}>
              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item>Archived</Grid>
                <Grid item>
                  <AntSwitch
                    checked={state.status == 'active'}
                    onChange={(e) => {
                      state.status = state.status == 'active' ? 'archived' : 'active';
                      setState({ ...state });
                    }}
                    name="status"
                  />
                </Grid>
                <Grid item>Active</Grid>
              </Grid>
            </Typography>
          )}
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
              {action == 'update' ? 'Update' : 'Create'}
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
          <Loading show={stage == STAGE.LOADING} />
          <Formik validationSchema={validation} onSubmit={_handleSubmit} initialValues={state}>
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
