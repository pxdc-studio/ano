import React, { useState, useMemo } from 'react';
import { Box, Container, makeStyles, Backdrop, Modal, TextField, Fade, Typography, Button } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllResources, deleteResource, postResource, putResource } from 'src/services/resourcesService';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AddIcon from '@material-ui/icons/Add';

/**
 * path: /app/resources
 *      description: resources CRUD
 */

// Styles for root component
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
// MUI Theme Provider for using custom fonts
const themeTable = createMuiTheme({
  palette: {
    primary: {
      main: '#3f51b5'
    },
    secondary: {
      main: '#3f51b5'
    }
  },
  typography: {
    fontFamily: [
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(',')
  }
});

export function PopupModal({ show }) {
  const classes = useStyles();

  function evtClose() {}

  function _handleSubmit() {}

  function Form({ errors, handleBlur, handleChange, handleSubmit, isSubmitting }) {
    return (
      <>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <Typography color="textPrimary" variant="h2">
              New Resource
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
            autoComplete={false}
          />

          <TextField
            // eslint-disable-next-line no-unneeded-ternary
            error={errors.message != null}
            fullWidth
            label="url"
            margin="normal"
            required
            name="message"
            inputProps={{ maxLength: 280 }}
            multiline
            rowsMax={6}
            onBlur={handleBlur}
            onChange={handleChange}
            variant="outlined"
            autoComplete={false}
          />

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
    url: Yup.string().required('url is required')
  });

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
          <Formik validationSchema={validation} onSubmit={_handleSubmit} initialValues={{}}>
            {Form}
          </Formik>
        </div>
      </Fade>
    </Modal>
  );
}

export default () => {
  const classes = useStyles();
  const theme = useTheme();
  const [loader, setLoader] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  async function fetchAllResources(query) {
    try {
      const { status, data } = await getAllResources({
        pageSize: query.pageSize,
        page: query.page
      });

      if (status === 200) {
        setLoader(false);

        return data;
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setLoader(false);
    }
  }

  // Resources remove function
  const handleDeleteResource = async ({ id }) => {
    try {
      const { data } = await deleteResource(id);
      const { status, message } = data;

      if (status === 200) {
        toast.success(message);
        return true;
      }
      toast.error(message);
    } catch (er) {
      toast.error('Server Error');
    }
  };

  const handleUpdateResource = async (newData) => {
    try {
      const { data } = await putResource(newData);
      const { status, message } = data;
      if (status === 200) {
        toast.success(message);
        return newData;
      }
      toast.error(message);
    } catch (er) {
      toast.error('Server Error');
    }
  };

  const handleAddResource = async (newData) => {
    try {
      const { data } = await postResource(newData);
      const { status, message } = data;
      if (status === 200) {
        toast.success(message);
        return newData;
      }
      toast.error(message);
    } catch (er) {
      toast.error('Server Error');
    }
  };

  const COLUMNS = [
    {
      title: 'Name',
      field: 'name',
      render: (dataRow) => dataRow.name,
      validate: (rowData) => rowData.name != null && rowData.name.length > 0
    },
    { title: 'Url', field: 'url', validate: (rowData) => rowData.url != null && rowData.url.length > 0 }
  ];

  const OPTIONS = {
    addRowPosition: 'first',
    actionsColumnIndex: -1,
    search: false,
    filtering: true,
    paging: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    headerStyle: {
      backgroundColor: theme.palette.primary.main,
      color: '#FFF',
      '&:hover': {
        color: '#FFF'
      }
    },
    rowStyle: (rowData) => ({
      fontFamily: 'Roboto',
      backgroundColor:
        selectedRow === rowData.tableData.id ? theme.palette.background.dark : theme.palette.background.default,
      color: theme.palette.text.primary
    })
  };

  return useMemo(() => {
    return (
      <Page className={classes.root} title="Resources">
        <Container maxWidth={false}>
          <Box mt={3}>
            <MuiThemeProvider theme={themeTable}>
              <MaterialTable
                title="Resources"
                isLoading={loader}
                columns={COLUMNS}
                data={fetchAllResources}
                editable={{
                  onRowAdd: handleAddResource,
                  onRowUpdate: handleUpdateResource,
                  onRowDelete: handleDeleteResource
                }}
                // eslint-disable-next-line
                onRowClick={(evt, selectedRow) => setSelectedRow(selectedRow.tableData.id)}
                options={OPTIONS}
              />
            </MuiThemeProvider>
          </Box>
        </Container>
      </Page>
    );
  }, [loader]);
};
