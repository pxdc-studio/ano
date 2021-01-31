import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Box, Button, Container, Grid, Link, TextField, Typography, makeStyles } from '@material-ui/core';
import { toast } from 'react-toastify';
import FacebookIcon from 'src/icons/Facebook';
import GoogleIcon from 'src/icons/Google';
import Page from 'src/components/Page';
import { loginUser } from '../../services/authService';

// Styles for "<Page/>"" Component
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const LoginView = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  // login handler response status need to be 200
  // for navigating to authenticated routes
  const _handleSubmit = async (values) => {
    try {
      const { status } = await loginUser(values);
      if (status === 200) {
        navigate('/announcements', { replace: true });
      }
    } catch (ex) {
      toast.error(ex.response.data.data[0].messages[0].message);
    }
  };

  return (
    <Page className={classes.root} title="Login">
      <Box display="flex" flexDirection="column" height="100%" justifyContent="center">
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              identifier: 'demo@devias.io',
              password: 'Password123'
            }}
            validationSchema={Yup.object().shape({
              identifier: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
              password: Yup.string().max(255).required('Password is required')
            })}
            onSubmit={async (values, { setSubmitting }) => {
              await _handleSubmit(values);
              await setSubmitting(false);
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <Typography color="textPrimary" variant="h2">
                    Sign in
                  </Typography>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Sign in on the internal platform
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Button
                      color="primary"
                      fullWidth
                      startIcon={<FacebookIcon />}
                      onClick={handleSubmit}
                      size="large"
                      variant="contained"
                    >
                      Login with Facebook
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      startIcon={<GoogleIcon />}
                      onClick={handleSubmit}
                      size="large"
                      variant="contained"
                    >
                      Login with Google
                    </Button>
                  </Grid>
                </Grid>
                <Box mt={3} mb={1}>
                  <Typography align="center" color="textSecondary" variant="body1">
                    or login with email address
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.identifier && errors.identifier)}
                  fullWidth
                  helperText={touched.identifier && errors.identifier}
                  label="Email Address"
                  margin="normal"
                  name="identifier"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="email"
                  value={values.identifier}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  label="Password"
                  margin="normal"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  variant="outlined"
                />
                <Box my={2}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Sign in now
                  </Button>
                </Box>
                <Typography color="textSecondary" variant="body1">
                  {/* Ampersand escapes */}
                  Don&apos;t have an account?{' '}
                  <Link component={RouterLink} to="/register" variant="h6">
                    Sign up
                  </Link>
                </Typography>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

export default LoginView;
