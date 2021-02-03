import React, { useState } from 'react';
import { Box, Container, makeStyles, Chip } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { deleteAnnouncement, getAllAnnouncementsByUser } from 'src/services/announcementService';
import moment from 'moment';
import { toast } from 'react-toastify';

import TagIcon from '@material-ui/icons/Bookmark';
import TagsIcon from '@material-ui/icons/Bookmarks';
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

const AnnouncementListView = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const theme = useTheme();
  const [loader, setLoader] = useState(true);

  async function fetchAllAnnouncementsByUser(query) {
    try {
      const { status, data } = await getAllAnnouncementsByUser({
        pageSize: query.pageSize,
        page: query.page
      });

      if (status === 200) {
        // this is due to sql return nesting object, best to due with it now
        data.data = data.data.map((item) => {
          item.synonyms = item.synonyms.map((syn) => {
            syn.tags = syn.tags.map((tag) => tag.tag);
            return syn;
          });
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

  async function handleDeleteResource({ id }) {
    try {
      const { data } = await deleteAnnouncement(id);
      const { status, message } = data;
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
      // custom action for update in new tab
      icon: 'create',
      tooltip: 'Update Announcement',

      // eslint-disable-next-line
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
      onClick: () => {
        navigate(`/announcements/add`);
      }
    }
  ];

  const COLUMNS = [
    { title: 'Title', field: 'title' },
    {
      title: 'Status',
      field: 'status',
      lookup: { active: 'Active', archived: 'Archived' }
    },
    {
      title: 'Post Date',
      field: 'postdate',
      render: (rowData) => moment(rowData.postdate).format('DD-MM-YYYY'),
      editable: 'never'
    },
    {
      title: 'Tags',
      render: (rowData) =>
        rowData.tags.map((r) => {
          return <Chip icon={<TagIcon />} key={r.name} label={r.slug} size="small" style={{ margin: 2 }} />;
        })
    },
    {
      title: 'Synonyms',
      render: (rowData) =>
        rowData.synonyms.map((r) => {
          return <Chip icon={<TagsIcon />} key={r.name} label={r.slug} size="small" style={{ margin: 2 }} />;
        })
    }
  ];

  const DETAIL = [
    {
      icon: 'description',
      tooltip: 'Show Resource',
      render: (rowData) => {
        return (
          <div className={classes.resources}>
            <h3>Messages</h3>
            <div>{rowData.message}</div>
            {rowData.resources.length > 0 && (
              <>
                <hr />
                <h3>Resources</h3>
                <ul>
                  {rowData.resources.map((item, index) => (
                    <div key={item.slug}>
                      <span>{index + 1}</span>
                      <span className="col">{item.slug}</span>
                      <span className="col">{item.url}</span>
                    </div>
                  ))}
                </ul>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const OPTIONS = {
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
    }
  };

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
              columns={COLUMNS}
              data={fetchAllAnnouncementsByUser}
              detailPanel={DETAIL}
              options={OPTIONS}
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
};

export default AnnouncementListView;
