import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  makeStyles,
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
import { getAllTags } from 'src/services/tagsServices';
import { getAllAuthors } from 'src/services/authorService';
import { postSubscription, putSubscription } from 'src/services/subscriptionService';
/**
 * path: /app/add-subscriptions/new
 *      description: adds new subscriptions
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

const SubscriptionForm = () => {
  const classes = useStyles();
  const disgestsArr = ['daily', 'weekly', 'monthly'];
  const navigate = useNavigate();
  const { id } = useParams(); // get params ID v.i.a useParams hook
  const { state } = useLocation(); // get state from routing v.i.a useLocation hook
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    // Fetch all Tags define
    async function fetchAllTags() {
      const { status, data } = await getAllTags();
      if (status === 200) {
        setTags(data);
      }
    }
    // Fetch all Authors function define
    async function fetchAllAuthors() {
      const { status, data } = await getAllAuthors();
      if (status === 200) {
        setAuthors(data);
      }
    }
    // Fetch all Tag function call
    fetchAllTags();
    // Fetch all Author function call
    fetchAllAuthors();
  }, []);
  // Save and Update Subscription
  const _handleSubmit = async (values) => {
    if (id === 'new') {
      const { status } = await postSubscription(values);
      if (status === 200) {
        navigate('/app/subscriptions', { replace: true });
      }
    } else {
      const { status } = await putSubscription({ ...values, id });
      if (status === 200) {
        navigate('/app/subscriptions', { replace: true });
      }
    }
  };

  return (
    <Page
      className={classes.root}
      title="Subscriptions"
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
            initialValues={state.subscribeObj}
            validationSchema={Yup.object().shape({
              digest: Yup.string().max(255).required('Digest Name is required'),
              author: Yup.number().required('Author is required'),
              tag: Yup.number().required('Tag is required')
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
                    Subscription
                  </Typography>
                </Box>
                <Box my={3}>
                  <FormControl error={Boolean(touched.announId && errors.announId)} fullWidth>
                    <InputLabel>Digests</InputLabel>
                    <Select
                      name="digest"
                      fullWidth
                      value={values.digest}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    >
                      {disgestsArr.map((digest) => (
                        <MenuItem key={digest} value={digest}>{digest.toUpperCase()}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box my={3}>
                  <FormControl error={Boolean(touched.announId && errors.announId)} fullWidth>
                    <InputLabel>Authors</InputLabel>
                    <Select
                      name="author"
                      fullWidth
                      value={values.author}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    >
                      {authors.map((author) => (
                        <MenuItem key={author.id} value={author.id}>{author.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box my={3}>
                  <FormControl error={Boolean(touched.announId && errors.announId)} fullWidth>
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
                    {id === 'new' ? 'Add Subscription' : 'Update Subscription'}
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

export default SubscriptionForm;
