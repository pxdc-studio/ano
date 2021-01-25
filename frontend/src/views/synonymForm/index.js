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
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { postSendEmail } from 'src/services/emailSendService';
import { getAllTags } from 'src/services/tagsServices';
import { postSynonym, putSynonyms } from 'src/services/synonymsService';
/**
 * path: /app/add-synonyms/new
 *      description: adds new synonyms
 */
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
  const { id } = useParams();
  const { state } = useLocation(); // get state from routing v.i.a hook
  const [tags, setTags] = useState([]);

  const sendAlertEmail = async () => {
    await postSendEmail({ to: 'faisal.hafeez77@gmail.com', from: 'malikbasitmaqsood@gmail.com' });
  };

  useEffect(() => {
    // fetching all Tags function define
    async function fetchAllTags() {
      const { status, data } = await getAllTags();
      if (status === 200) {
        setTags(data);
      }
    }
    // fetching all Tags function call
    fetchAllTags();
  }, []);
  //save and update synonym
  const _handleSubmit = async (values) => {
    if (id === 'new') {
      const { status } = await postSynonym(values);
      if (status === 200) {
        sendAlertEmail();
        navigate('/app/synonyms', { replace: true });
      }
    } else {
      const { status } = await putSynonyms({ ...values, id });
      if (status === 200) {
        navigate('/app/synonyms', { replace: true });
      }
    }
  };

  return (
    <Page
      className={classes.root}
      title="Synonyms"
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
            initialValues={state.synonymObj}
            validationSchema={Yup.object().shape({
              name: Yup.string().max(255).required('Synonym is required'),
              slug: Yup.string().required('Slug is required'),
              tag: Yup.number().required('Tag is required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              await _handleSubmit(values);
              await setSubmitting(false);
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <Typography
                    color="textPrimary"
                    variant="h2"
                  >
                    Resource
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.name && errors.name)}
                  fullWidth
                  helperText={touched.name && errors.name}
                  label="Synonym"
                  margin="normal"
                  name="name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.slug && errors.slug)}
                  fullWidth
                  helperText={touched.slug && errors.slug}
                  label="Slug"
                  margin="normal"
                  name="slug"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.slug}
                  variant="outlined"
                />
                <Box my={2}>
                  <FormControl error={Boolean(touched.tag && errors.tag)} fullWidth>
                    <InputLabel>Tags</InputLabel>
                    <Select
                      name="tag"
                      fullWidth
                      value={values.tag}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    >
                      {tags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box my={4}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    {id === 'new' ? 'Add Synonym' : 'Update Synonym'}
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
