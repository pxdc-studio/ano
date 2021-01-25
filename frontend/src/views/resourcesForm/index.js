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
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { postResource, putResource } from 'src/services/resourcesService';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

/**
 * path: /app/add-resources/new
 *      description: adds new resources
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

// eslint-disable-next-line no-unused-vars
const ResourcesForm = ({ isModal }) => {
  const resObjDefault = { name: '', url: '' };
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams(); // get params ID v.i.a useParams hook
  const { state } = useLocation(); // get state from routing v.i.a useLocation hook
  // Save and Update Resource
  const _handleSubmit = async (values) => {
    if (id === 'new') {
      const { status } = await postResource(values);
      if (status === 200) {
        if (isModal === false) {
          navigate('/app/resources', { replace: true });
        } else {
          toast.success('Resource Added Successfully');
        }
      }
    } else {
      const { status } = await putResource({ ...values, id });
      if (status === 200) {
        if (isModal === false) { navigate('/app/resources', { replace: true }); } else {
          toast.success('Resource Added Successfully');
        }
      }
    }
  };

  return (<>
    {isModal === false
      ? <Page
        className={classes.root}
        title="Resources"
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
              initialValues={state.resourceObj !== undefined ? state.resourceObj : resObjDefault}
              validationSchema={Yup.object().shape({
                name: Yup.string().max(255).required('Resource Name is required'),
                url: Yup.string().required('Resource Url is required'),
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
                      Resource
                  </Typography>
                  </Box>
                  <TextField
                    error={Boolean(touched.name && errors.name)}
                    fullWidth
                    helperText={touched.name && errors.name}
                    label="Resource Name"
                    margin="normal"
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    variant="outlined"
                  />
                  <TextField
                    error={Boolean(touched.url && errors.url)}
                    fullWidth
                    helperText={touched.url && errors.url}
                    label="Resource Url"
                    margin="normal"
                    name="url"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.url}
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
                      {id === 'new' ? 'Add Resource' : 'Update Resource'}
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
            initialValues={state.resourceObj !== undefined ? state.resourceObj : resObjDefault}
            validationSchema={Yup.object().shape({
              name: Yup.string().max(255).required('Resource Name is required'),
              url: Yup.string().required('Resource Url is required'),
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
                    Resource
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.name && errors.name)}
                  fullWidth
                  helperText={touched.name && errors.name}
                  label="Resource Name"
                  margin="normal"
                  name="name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.url && errors.url)}
                  fullWidth
                  helperText={touched.url && errors.url}
                  label="Resource Url"
                  margin="normal"
                  name="url"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.url}
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
                    {id === 'new' ? 'Add Resource' : 'Update Resource'}
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

ResourcesForm.propTypes = {
  isModal: PropTypes.bool
};

export default ResourcesForm;
