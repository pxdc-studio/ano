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

import { Resources, Tags, Synonyms } from '../form.crud/index';
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
    const { status } = await deleteAnnouncement(id);
    if (status === 200) {
      return true;
    }
    return false;
  }

  async function handleUpdateResource(v, o) {
    v.resources = resourceRef.current.value;
    v.synonyms = synonymRef.current.value;
    v.tags = tagRef.current.value;

    const { status } = await putAnnouncement({
      id: v.id,
      title: v.title,
      message: v.message,
      tags: tagRef.current.value.map((r) => ({ slug: r.title })),
      resources: resourceRef.current.value.map((r) => ({ slug: r.title, url: r.url })),
      synonyms: synonymRef.current.value.map((r) => ({ slug: r.title }))
    });
    if (status === 200) {
      return v;
    }
  }

  const ACTIONS = [
    {
      icon: 'add',
      tooltip: 'Add Announcement',
      position: 'toolbar',
      isFreeAction: true,
      onClick: () => setStage(STAGE.CREATE)
    }
  ];

  // return useMemo(() => {
  return (
    <Page className={classes.root} title="Announcement">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <ModalAddAnnouncement
              show={stage == STAGE.CREATE}
              onClose={(e) => {
                tableRef.current && tableRef.current.onQueryChange();
                setStage(STAGE.READY);
              }}
            />
            <MaterialTable
              tableRef={tableRef}
              title="My Announcement"
              isLoading={loader}
              actions={ACTIONS}
              editable={{
                // onRowAdd: handleAddResource,
                onRowUpdate: handleUpdateResource,
                onRowDelete: handleDeleteResource
              }}
              columns={[
                { title: 'Title', field: 'title' },
                {
                  title: 'Status',
                  field: 'status',
                  lookup: { active: 'Active', archieved: 'Archieved' }
                },
                {
                  title: 'Post Date',
                  field: 'postdate',
                  render: (rowData) => moment(rowData.postdate).format('MMMM Do YYYY'),
                  editable: 'never'
                },
                {
                  title: 'Tags',
                  field: 'tags',
                  render: (rowData) =>
                    rowData.tags.map((r, index) => {
                      return <Chip key={index} label={r.slug} />;
                    }),
                  editComponent: ({ rowData }) => {
                    let data = rowData.tags.map((r) => ({ title: r.slug.split('-').join(' ') }));
                    return <Tags name="Tags" service={getTagsAutocomplete} ref={tagRef} value={data} />;
                  }
                },
                {
                  title: 'Synonyms',
                  field: 'synonyms',
                  render: (rowData) =>
                    rowData.synonyms.map((r, index) => {
                      return <Chip key={index} label={r.slug} />;
                    }),
                  editComponent: ({ rowData }) => {
                    let data = rowData.synonyms.map((r) => ({ title: r.slug.split('-').join(' ') }));
                    return <Synonyms name="Synonyms" service={getSynonymsAutocomplete} ref={synonymRef} value={data} />;
                  }
                },
                {
                  title: 'Resource',
                  field: 'resources',
                  render: (rowData) =>
                    rowData.resources.map((r, index) => {
                      return <Chip key={index} label={r.slug} />;
                    }),
                  editComponent: ({ rowData }) => {
                    let data = rowData.resources.map((r) => ({ title: r.slug.split('-').join(' '), url: r.url }));
                    return (
                      <Resources name="Resources" service={getResourceAutocomplete} ref={resourceRef} value={data} />
                    );
                  }
                }
              ]}
              data={fetchAllAnnouncementsByUser}
              // detailPanel={[
              //   {
              //     icon: 'description',
              //     tooltip: 'Show Resource',
              //     render: (rowData) => {
              //       return (
              //         <div className={classes.resources}>
              //           <h3>Resources</h3>
              //           <ul>
              //             {rowData.resources.map((item, index) => (
              //               <div key={index}>
              //                 <span>{index + 1}</span>
              //                 <span className="col">{item.slug}</span>
              //                 <span className="col">{item.url}</span>
              //               </div>
              //             ))}
              //           </ul>
              //         </div>
              //       );
              //     }
              //   }
              // ]}
              // onRowClick={(evt, selectedRow) => setSelectedRow(selectedRow.tableData.id)}
              options={{
                actionsColumnIndex: -1,
                search: false,
                filtering: false,
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
              // actions={[
              //   {
              //     // custom action for update in new tab
              //     icon: 'create',
              //     tooltip: 'Update Announcement',
              //     onClick: (event, rowData) => {
              //       const { id, title, message, postdate, status, tags, resources } = rowData;
              //       navigate(
              //         `/app/announcements/update/${id}`,
              //         {
              //           state: {
              //             announObj: {
              //               title,
              //               message,
              //               postdate,
              //               status,
              //               tags,
              //               resources
              //             }
              //           }
              //         },
              //         { replace: true }
              //       );
              //     }
              //   },
              //   {
              //     // overrides in-built add action in material table
              //     icon: 'add',
              //     tooltip: 'Add Announcement',
              //     position: 'toolbar',
              //     isFreeAction: true,
              //     onClick: () => setStage(STAGE.CREATE)
              //   }
              // ]}
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
  // }, [loader]);
};

export default AnnouncementListView;
