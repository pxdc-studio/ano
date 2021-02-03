/* eslint-disable */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Container, makeStyles, Chip, Grid, Button, ButtonGroup, TextField } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { deleteAnnouncement, getAllAnnouncementsByUser, putAnnouncement } from 'src/services/announcementService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { ModalAddAnnouncement } from '../form.crud';

import { StageContext } from '../context';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { getTagsAutocomplete } from 'src/services/tagsServices';
import { getResourceAutocomplete } from 'src/services/resourcesService';
import { getSynonymsAutocomplete } from 'src/services/synonymsService';
import TagIcon from '@material-ui/icons/Bookmark';
import TagsIcon from '@material-ui/icons/Bookmarks';
import { AutocompleteByTagName } from '../form.crud/tags.autocomplete';
// Styles for root component
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(20)
  },
  resources: {
    padding: 8,
    background: '#eee',
    '& div': {
      display: 'flex',
      flexDirection: 'row',
      padding: 8,
      '& span.col': {
        flex: 1
      },
      '& span:first-of-type': { width: 20 }
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

const STAGE = {
  CREATE: 0,
  READY: 1
};

const AnnouncementListView = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const theme = useTheme();
  const [loader, setLoader] = useState(true);
  const [stage, setStage] = useState(STAGE.READY);
  const [selectedRow, setSelectedRow] = useState(null);

  async function fetchAllAnnouncementsByUser(query) {
    try {
      let { status, data } = await getAllAnnouncementsByUser({
        pageSize: query.pageSize,
        page: query.page
      });

      if (status == 200) {
        data.data = data.data.map((item) => {
          item.synonyms = item.synonyms.map((syn) => {
            syn.tags = syn.tags.map((tag) => tag.tag);
            return syn;
          }); // this is due to sql return nesting object,
          return item;
        });

        setLoader(false);
        return data;
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setLoader(false);
    }
  }

  let resourceRef = useRef();
  let tagRef = useRef();
  let synonymRef = useRef();
  let tableRef = useRef();

  async function handleDeleteResource({ id }) {
    try {
      const { data } = await deleteAnnouncement(id);
      let { status, message } = data;
      if (status === 200) {
        toast.success(message);
        return true;
      }
      toast.error(message);
    } catch (e) {
      toast.error('Server Error');
    }
  }

  const ACTIONS = [
    {
      icon: 'add',
      tooltip: 'Add Announcement',
      position: 'toolbar',
      isFreeAction: true,
      onClick: () => {
        navigate('/announcements/add');
      }
    }
  ];

  // return useMemo(() => {
  return (
    <Page className={classes.root} title="Announcement">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="My Announcement"
              isLoading={loader}
              actions={ACTIONS}
              editable={{
                onRowDelete: handleDeleteResource
              }}
              columns={[
                { title: 'Title', field: 'title' },
                {
                  title: 'Status',
                  field: 'status',
                  lookup: { active: 'Active', archived: 'Archived' }
                },
                {
                  title: 'Post Date',
                  field: 'postdate',
                  render: (rowData) => moment(rowData.postdate).format('MMMM Do YYYY'),
                  editable: 'never'
                },
                {
                  title: 'Tags',
                  render: (rowData) =>
                    rowData.tags.map((r, index) => {
                      return <Chip icon={<TagIcon />} key={index} label={r.slug} size="small" style={{ margin: 2 }} />;
                    })
                },
                {
                  title: 'Synonyms',
                  render: (rowData) =>
                    rowData.synonyms.map((r, index) => {
                      return <Chip icon={<TagsIcon />} key={index} label={r.slug} size="small" style={{ margin: 2 }} />;
                    })
                }
              ]}
              data={fetchAllAnnouncementsByUser}
              detailPanel={[
                {
                  icon: 'description',
                  tooltip: 'Show Resource',
                  render: (rowData) => {
                    return (
                      <div className={classes.resources}>
                        <h3>Resources</h3>
                        <ul>
                          {rowData.resources.map((item, index) => (
                            <div key={index}>
                              <span>{index + 1}</span>
                              <span className="col">{item.name}</span>
                              <span className="col">{item.url}</span>
                            </div>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                }
              ]}
              // onRowClick={(evt, selectedRow) => setSelectedRow(selectedRow.tableData.id)}
              options={{
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
                    selectedRow === rowData.tableData.id
                      ? theme.palette.background.dark
                      : theme.palette.background.default,
                  color: theme.palette.text.primary
                })
              }}
              actions={[
                {
                  // custom action for update in new tab
                  icon: 'create',
                  tooltip: 'Update Announcement',
                  onClick: (event, rowData) => {
                    const { id, title, message, postdate, status, tags, resources, synonyms } = rowData;
                    navigate(`/announcements/update/${id}`, {
                      state: {
                        id,
                        title,
                        message,
                        tags,
                        resources,
                        synonyms,
                        status,
                        postdate
                      }
                    });
                  }
                },
                {
                  icon: 'create',
                  tooltip: 'Add Announcement',
                  isFreeAction: true,
                  onClick: (event, rowData) => {
                    navigate(`/announcements/add`);
                  }
                }
              ]}
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
  // }, [loader]);
};

export default AnnouncementListView;
