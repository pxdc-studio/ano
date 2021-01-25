import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  makeStyles,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  FormHelperText
} from '@material-ui/core';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Formik, Field } from 'formik';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import TagsModal from 'src/components/tagsModal';
import { postAnnouncement, putAnnouncement, getSingleAnnouncement } from 'src/services/announcementService';
import { getAllTags, deleteTag } from 'src/services/tagsServices';
import { getAllResources, getSingleResource, deleteResource } from 'src/services/resourcesService';
import { getCurrentUser } from 'src/services/authService';
import ResourcesModal from 'src/components/resourcesModal';
import AddIcon from '@material-ui/icons/Add';

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

  }
}));

const AnnouncementListView = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams(); // get params ID v.i.a hook
  const { state } = useLocation(); // get state from useLocation routing
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isModal, setIsModal] = React.useState(false);
  // Resources selection
  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [openRes, setOpenRes] = React.useState(false);
  const [isModalRes, setIsModalRes] = React.useState(false);
  console.log(state);
  // Sync Tags with Backend Database v.i.a calling API
  async function updateTagsOfAnnouncement() {
    const { status, data } = await getSingleAnnouncement(id);
    if (status === 200) {
      const { tags: updatedTags } = data;
      setSelectedTags(updatedTags);
    }
  }

  // Sync Resources with Backend Database v.i.a calling API
  async function updateResourceOfAnnouncement() {
    const { status, data } = await getSingleResource(id);
    if (status === 200) {
      console.log('data for res', data);
      const { resources: updatedResources } = data;
      setSelectedResources(updatedResources);
    }
  }

  // Fetching all Tags
  async function fetchAllTags() {
    const { status, data } = await getAllTags();
    if (status === 200) {
      setTags(data);
    }
  }
  // Fetching all Resources 
  async function fetchAllResources() {
    const { status, data } = await getAllResources();
    if (status === 200) {
      console.log('data for res', data);
      setResources(data);
    }
  }

  const handleClickOpen = () => { // Opens Tag Modal
    setOpen(true);
    setIsModal(true);
  };

  const handleClose = () => { // Closes Tag Modal
    setOpen(false);
    fetchAllTags();
  };

  const handleClickOpenRes = () => { // Opens Resource Modal
    setOpenRes(true);
    setIsModalRes(true);
  };
  const handleCloseResModal = () => { // Closes Tag Modal
    setOpenRes(false);
    fetchAllResources();
  };

  useEffect(() => {
    function getSelectedTags() { // Filters out Tags in Chips Componenet
      const { tags: prevSelectTag } = state.announObj;
      if (prevSelectTag && prevSelectTag.length > 0) {
        setSelectedTags(prevSelectTag);
      } else {
        setSelectedTags([]);
      }
    }
    function getSelectedResources() { // Filters out Resources in Chips Componenet
      const { resources: prevSelectRes } = state.announObj;
      if (prevSelectRes && prevSelectRes.length > 0) {
        setSelectedResources(prevSelectRes);
      } else {
        setSelectedResources([]);
      }
    }
    getSelectedResources();
    getSelectedTags();
    fetchAllResources();
    fetchAllTags();
  }, []);
  // pushes tags in state which is selectedTags
  const handleChangeTags = ({ target: { value } }, field, values, setValues) => {
    const updateSelectedTag = [...selectedTags];
    updateSelectedTag.push(value);
    setSelectedTags(updateSelectedTag);
    const valuesOfTags = updateSelectedTag.map((selectedTag) => selectedTag.id);
    setValues({ ...values, tags: valuesOfTags });
  };
  // pushes resources in state which is selectedResources
  const handleChangeResources = ({ target: { value } }, field, values, setValues) => {
    const updateSelectedResource = [...selectedResources];
    updateSelectedResource.push(value);
    setSelectedResources(updateSelectedResource);
    const valuesOfResources = updateSelectedResource.map((selectedResource) => selectedResource.id);
    setValues({ ...values, resources: valuesOfResources });
  };
  // Excludes tags from chips component and fetch new ones
  const handleDeleteTag = async (tagId) => {
    if (id === 'new') {
      let updateSelectedTag = [...selectedTags];
      updateSelectedTag = updateSelectedTag.filter((selectedTag) => selectedTag.id !== tagId);
      setSelectedTags(updateSelectedTag);
    } else {
      const { status } = await deleteTag(tagId);
      if (status === 200) {
        toast.error('Tag Deleted');
        updateTagsOfAnnouncement();
      }
    }
  };
  // Excludes resources from chips component and fetch new ones
  const handleDeleteResource = async (resourceId) => {
    if (id === 'new') {
      let updateSelectedResource = [...selectedResources];
      updateSelectedResource = updateSelectedResource
        .filter((selectedResource) => selectedResource.id !== resourceId);
      setSelectedResources(updateSelectedResource);
    } else {
      const { status } = await deleteResource(resourceId);
      if (status === 200) {
        toast.error('Tag Deleted');
        updateResourceOfAnnouncement();
      }
    }
  };
  // Save and Update Announcement 
  const _handleSubmit = async (values) => {
    const { postdate } = values;
    const { id: authorId } = getCurrentUser();
    const announObj = { ...values, postdate: new Date(postdate), author_id: authorId };
    console.log(announObj);
    if (id === 'new') {
      const { status } = await postAnnouncement(announObj);
      if (status === 200) {
        navigate('/app/announcements', { replace: true });
      }
    } else {
      const { status } = await putAnnouncement({ ...announObj, id });
      if (status === 200) {
        navigate('/app/announcements', { replace: true });
      }
    }
  };

  return (
    <Page
      className={classes.root}
      title="Announcement"
    >
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <Container maxWidth="sm">
          <Formik
            enableReinitializ
            initialValues={state.announObj}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(80).required('Title is required'),
              message: Yup.string().max(280).required('Message is required'),
              status: Yup.number().required('Status is required'),
              postdate: Yup.date().required('Post Date is required'),
              tags: Yup.array().required('Tags are required'),
            })}
            onSubmit={async (values) => {
              await _handleSubmit(values);
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              setValues
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  {
                    id === 'new' ? (
                      <Typography
                        color="textPrimary"
                        variant="h2"
                      >
                        New Announcement
                      </Typography>
                    )
                      : (
                        <Typography
                          color="textPrimary"
                          variant="h2"
                        >
                          Update Announcements
                        </Typography>
                      )
                  }
                </Box>
                <TextField
                  // eslint-disable-next-line no-unneeded-ternary
                  error={errors.title && errors.title.length > 0 ? true : false}
                  fullWidth
                  helperText={`${values.title.length}/${TITLE_LIMIT}`}
                  label="Title"
                  margin="normal"
                  name="title"
                  inputProps={{ maxLength: 80 }}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.title}
                  variant="outlined"
                />
                <TextField
                // eslint-disable-next-line no-unneeded-ternary
                  error={errors.message && errors.message.length > 0 ? true : false}
                  fullWidth
                  helperText={`${values.message.length}/${MESSAGE_LIMIT}`}
                  label="Message"
                  margin="normal"
                  required
                  name="message"
                  inputProps={{ maxLength: 280 }}
                  multiline
                  rowsMax={6}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.message}
                  variant="outlined"
                />
                <Box my={2}>
                  <FormControl
                    error={Boolean(touched.status && errors.status)}
                    fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      fullWidth
                      value={values.status}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    >
                      <MenuItem value={0}>Active</MenuItem>
                      <MenuItem value={1}>Archive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  error={!!touched.postdate && !!errors.postdate}
                  fullWidth
                  helperText={touched.postdate && errors.postdate}
                  value={values.postdate}
                  type="date"
                  label="Post Date"
                  margin="normal"
                  name="postdate"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  variant="outlined"
                />
                <TagsModal
                  onOpen={handleClickOpen}
                  onClose={handleClose}
                  open={open}
                  isModal={isModal} />
                <Box my={2}>
                  <FormControl error={Boolean(errors.tags)} fullWidth>
                    <InputLabel>Tags</InputLabel>
                    <Field name="tags">
                      {({ field }) => (
                        <Select
                        defaultValue=""
                          name="tags"
                          {...field}
                          fullWidth
                          value={values.tags}
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeTags(e, field, values, setValues)}
                        >
                          {tags.map((tag) => (

                            <MenuItem key={tag.id} value={tag}>{tag.name}</MenuItem>

                          ))}
                        </Select>
                      )}
                    </Field>
                    <FormHelperText>{errors.tags}</FormHelperText>
                  </FormControl>
                </Box>
                <Box mb={4}>
                  {selectedTags && (selectedTags.map((tag) => {
                    return (
                      <Chip
                        size="small"
                        key={tag.id}
                        label={tag.name}
                        onDelete={() => handleDeleteTag(tag.id)}
                        style={{ marginLeft: 5 }}
                        color="primary"
                        variant="outlined" />);
                  }))}
                </Box>

                {/** Resoucres Box * */}
                <ResourcesModal
                  onOpen={handleClickOpenRes}
                  onClose={handleCloseResModal}
                  open={openRes}
                  isModal={isModalRes} />
                <Box my={2}>
                  <FormControl error={Boolean(errors.resources)} fullWidth>
                    <InputLabel>Resources</InputLabel>
                    <Field name="resources">
                      {({ field }) => (
                        <Select
                         defaultValue=""
                          name="resources"
                          {...field}
                          fullWidth
                          value={values.resources}
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeResources(e, field, values, setValues)}
                        >
                          {resources.map((res) => (
                            <MenuItem key={res.id} value={res}>{res.name}</MenuItem>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <FormHelperText>{errors.resources}</FormHelperText>
                  </FormControl>
                </Box>
                <Box>
                  {selectedResources && (selectedResources.map((res) => {
                    return (
                      <Chip
                        size="small"
                        key={res.id}
                        label={res.name}
                        onDelete={() => handleDeleteResource(res.id)}
                        style={{ marginLeft: 5 }}
                        color="primary"
                        variant="outlined" />);
                  }))}
                </Box>
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
                    {id === 'new' ? 'Add Announcement' : 'Update Announcement'}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

export default AnnouncementListView;
