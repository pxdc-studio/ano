import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  makeStyles,
  Chip,
  Grid
} from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme, } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { getAllAnnouncements, deleteAnnouncement } from 'src/services/announcementService';
import moment from 'moment';
import { toast } from 'react-toastify';

/**
 * path: /app/announcements
 *      description: announcements CRUD
 */

// Styles for root component
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(20),
  }
}));
// MUI Theme Provider for using custom fonts
const themeTable = createMuiTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#3f51b5',
    },
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
      '"Segoe UI Symbol"',
    ].join(','),
  }

});

const AnnouncementListView = () => {
  const dynamicLookupObject = { 0: 'active', 1: 'archive' }; // object for status values
  const navigate = useNavigate();
  const classes = useStyles();
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState();
  const [loader, setLoader] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedRow, setSelectedRow] = useState(null);
  // Announcements fetch request function define
  const fetchAllAnnouncements = async () => {
    try {
      const { status, data } = await getAllAnnouncements();
      if (status === 200) {
        setAnnouncements(data);
        setLoader(false);
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setAnnouncements([]);
      setLoader(false);
    }
  };

  useEffect(() => {
    // Announcements fetch request function call
    fetchAllAnnouncements();
  }, []);

  // Announcement remove function
  const handleDeleteAnnouncement = async (id) => {
    const { status } = await deleteAnnouncement(id);
    if (status === 200) {
      fetchAllAnnouncements();
    }
  };

  return (
    <Page
      className={classes.root}
      title="Announcement"
    >
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="Announcements "
              isLoading={loader}
              columns={[
                { title: 'ID', field: 'id', editable: 'never' },
                { title: 'AuthorID', field: 'author_id', editable: 'never' },
                { title: 'Title', field: 'title' },
                { title: 'Message', field: 'message' },
                {
                  title: 'Status',
                  field: 'status',
                  lookup: dynamicLookupObject,
                },
                {
                  title: 'Post Date',
                  field: 'postdate',
                  render: (rowData) => moment(rowData.postdate).format('MMMM Do YYYY'),
                  editable: 'never'

                },
                {
                  title: 'Date Created',
                  field: 'created_at',
                  render: (rowData) => moment(rowData.created_at).format('MMMM Do YYYY'),
                  editable: 'never'

                },
                {
                  title: 'Date Updated',
                  field: 'updated_at',
                  render: (rowData) => moment(rowData.updated_at).format('MMMM Do YYYY'),
                  editable: 'never'

                },
              ]}
              data={announcements}
              detailPanel={(rowData) => {
                return (rowData.tags.map((tag) => {
                  return (
                    <>
                      <Grid container direction="row" justify="center" alignItems="center">
                        <Grid item>
                          <Box m={2} style={{ width: '100%' }}>
                            <Chip label={tag.name} variant="outlined" size="small" color="primary" />
                          </Box>
                        </Grid>
                      </Grid>
                    </>
                  );
                }));
              }}
              editable={{
                onRowDelete: async ({ id }) => {
                  await handleDeleteAnnouncement(id);
                }
              }}
              // eslint-disable-next-line
              onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
              options={{
                actionsColumnIndex: -1,
                search: false,
                filtering: true,
                paging: false,
                headerStyle: {
                  backgroundColor: theme.palette.primary.main,
                  color: '#FFF',
                  '&:hover': {
                    color: '#FFF'
                  },
                },
                rowStyle: (rowData) => ({
                  fontFamily: 'Roboto',
                  backgroundColor: (selectedRow === rowData.tableData.id)
                    ? theme.palette.background.dark : theme.palette.background.default,
                  color: theme.palette.text.primary
                })
              }}
              actions={[
                { // custom action for update in new tab
                  icon: 'create',
                  tooltip: 'Update Announcement',
                  onClick: (event, rowData) => {
                    const { id, title, message, postdate, status, tags, resources } = rowData;
                    navigate(`/app/add-announcements/${id}`, {
                      state: {
                        announObj: {
                          title,
                          message,
                          postdate,
                          status,
                          tags,
                          resources
                        }
                      }
                    }, { replace: true });
                  }
                },
                { // overrides in-built add action in material table
                  icon: 'add',
                  tooltip: 'Add Announcement',
                  position: 'toolbar',
                  isFreeAction: true,
                  onClick: () => {
                    // Routing to Announcement Form on path: /app/add-announcements/new
                    navigate(`/app/add-announcements/${'new'}`, {
                      state: {
                        announObj: {
                          title: '',
                          message: '',
                          postdate: '2021-01-01',
                          status: ''
                        }
                      }
                    }, { replace: true });
                  }
                }
              ]}
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
};

export default AnnouncementListView;
