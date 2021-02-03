import React, { useMemo, useState } from 'react';
import { Box, Container, makeStyles, Chip } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { getAllAnnouncements } from 'src/services/announcementService';
import moment from 'moment';
import { toast } from 'react-toastify';
import FaceIcon from '@material-ui/icons/Face';
import TagIcon from '@material-ui/icons/Bookmark';
import TagsIcon from '@material-ui/icons/Bookmarks';
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
    paddingRight: theme.spacing(20)
  },
  tags: {
    margin: '16px 0',
    '& > *': {
      margin: theme.spacing(0.5)
    }
  },
  tags_popper: {
    width: 500,
    '& > * + *': {
      marginTop: theme.spacing(3)
    }
  },
  modal: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      outline: 'none'
    }
  },
  paper: {
    outline: 'none',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    borderRadius: '1em',
    '& > p > *': {
      verticalAlign: 'middle'
    }
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

function AnnouncementView() {
  const [loader, setLoader] = useState(true);
  const [selectedRow, setSelectedRow] = useState();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();

  async function fetchAnnouncements(query) {
    try {
      const { status, data } = await getAllAnnouncements({
        pageSize: query.pageSize,
        page: query.page
      });

      if (status === 200) {
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

  return useMemo(() => {
    const COLUMNS = [
      { title: 'Title', field: 'title' },
      {
        title: 'Author',
        field: 'author.username',
        editable: 'never',
        render: (rowData) => {
          return (
            <Chip icon={<FaceIcon />} size="small" label={rowData.author.username} clickable style={{ margin: 2 }} />
          );
        }
      },
      {
        title: 'Post Date',
        field: 'postdate',
        render: (rowData) => moment(rowData.postdate).format('MM-DD-YYYY'),
        editable: 'never'
      },
      {
        title: 'Tags',
        render: (rowData) => {
          return rowData.tags.map((item) => (
            <Chip icon={<TagIcon />} key={item.name} size="small" label={item.name} clickable style={{ margin: 2 }} />
          ));
        },
        editable: 'never'
      },
      {
        title: 'Synnonyms',
        render: (rowData) => {
          return rowData.synonyms.map((item) => (
            <Chip icon={<TagsIcon />} key={item.name} size="small" label={item.name} clickable style={{ margin: 2 }} />
          ));
        },
        editable: 'never'
      }
    ];

    const OPTIONS = {
      actionsColumnIndex: -1,
      search: false,
      filtering: true,
      paging: true,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50, 100],
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

    const ACTION = [
      {
        icon: 'create',
        tooltip: 'Add Announcement',
        isFreeAction: true,
        onClick: () => {
          navigate(`/announcements/add`);
        }
      }
    ];

    return (
      <Box mt={4}>
        <MuiThemeProvider theme={themeTable}>
          <MaterialTable
            title="Timeline"
            isLoading={loader}
            data={fetchAnnouncements}
            // eslint-disable-next-line
            onRowClick={(evt, _selectedRow) => setSelectedRow(_selectedRow.tableData.id)}
            columns={COLUMNS}
            options={OPTIONS}
            detailPanel={DETAIL}
            actions={ACTION}
          />
        </MuiThemeProvider>
      </Box>
    );
  }, [loader]);
}

const AnnouncementListView = () => {
  const classes = useStyles();

  return (
    <Page className={classes.root} title="Announcement">
      <Container maxWidth={false}>
        <AnnouncementView />
      </Container>
    </Page>
  );
};

export default AnnouncementListView;
