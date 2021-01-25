import React from 'react';
import {
  Box,
  Container,
  makeStyles,
  TextField,
  Typography,
  Button,
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import PropTypes from 'prop-types';
import { postTag, putTag } from 'src/services/tagsServices';

/**
 * path: /app/add-tags/new
 *      description: adds new announcement
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

const TagForm = ({ isModal }) => {
  const tagObjDefault = { name: '', slug: '' };
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams(); // get params ID v.i.a useParams hook
  const { state } = useLocation(); // get state from routing v.i.a useLocation hook
  // Save and Update Tag
  const _handleSubmit = async (values) => {
    if (id === 'new') {
      const { status } = await postTag(values);
      if (status === 200) {
        if (isModal === false) {
          navigate('/app/tags', { replace: true });
        } else {
          toast.success('Tag Added Successfully');
        }
      }
    } else {
      const { status } = await putTag({ ...values, id });
      if (status === 200) {
        if (isModal === false) {
          navigate('/app/tags', { replace: true });
        } else {
          toast.success('Tag Added Successfully');
        }
      }
    }
  };

  return (<>
    { isModal === false ? <Page
      className={classes.root}
      title="Tags"
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
            initialValues={state.tagObj !== undefined ? state.tagObj : tagObjDefault}
            validationSchema={Yup.object().shape({
              name: Yup.string().max(255).required('Tag Name is required'),
              slug: Yup.string().required('Tag Slug is required'),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              await _handleSubmit(values);
              await setSubmitting(false);
              await resetForm();
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
                    Tag
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.name && errors.name)}
                  fullWidth
                  helperText={touched.name && errors.name}
                  label="Tag"
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
                <Box my={4}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    {id === 'new' ? 'Add Tag' : 'Update Tag'}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
      : <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <Container maxWidth="sm">
          <Formik
            enableReinitializ
            initialValues={state.tagObj !== undefined ? state.tagObj : tagObjDefault}
            validationSchema={Yup.object().shape({
              name: Yup.string().max(255).required('Tag Name is required'),
              slug: Yup.string().required('Tag Slug is required'),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              await _handleSubmit(values);
              await setSubmitting(false);
              await resetForm();
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
                    Tag
              </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.name && errors.name)}
                  fullWidth
                  helperText={touched.name && errors.name}
                  label="Tag"
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
                <Box my={4}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    {id === 'new' ? 'Add Tag' : 'Update Tag'}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>}

  </>

  );
};

TagForm.propTypes = {
  isModal: PropTypes.bool
};

export default TagForm;
