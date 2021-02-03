/* eslint-disable */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Box, Container, makeStyles, Chip, Avatar, Popover, TextField, Modal, Backdrop, Fade } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { getAllAnnouncements } from 'src/services/announcementService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Label, Explicit } from '@material-ui/icons';
import { ModalAddAnnouncement } from '../form.crud';
import { StageContext } from '../context';
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

const STAGE = {
  CREATE: 0,
  READY: 1
};

function AnnouncementView() {
  const [stage, setStage] = useContext(StageContext);

  const [loader, setLoader] = useState(true);
  const [announcements, setAnnouncements] = useState();
  const [selectedRow, setSelectedRow] = useState();
  const theme = useTheme();
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  async function fetchAnnouncements(query) {
    try {
      let { status, data } = await getAllAnnouncements({
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
  // useEffect(() => {
  //   async function fetchAnnouncements() {
  //     try {
  //       const { status, data } = await getAllAnnouncements({ pageSize, page });
  //       if (status === 200) {
  //         setAnnouncements(data.data);
  //         setLoader(false);
  //       }
  //     } catch (ex) {
  //       toast.error(ex.response.data.message);
  //       setAnnouncements([]);
  //       setLoader(false);
  //     }
  //   }
  //   fetchAnnouncements();
  // }, [pageSize, page]);

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
          return rowData.tags.map((item, index) => (
            <Chip icon={<TagIcon />} key={index} size="small" label={item.name} clickable style={{ margin: 2 }} />
          ));
        },
        editable: 'never'
      },
      {
        title: 'Synnonyms',
        render: (rowData) => {
          return rowData.synonyms.map((item, index) => (
            <Chip icon={<TagsIcon />} key={index} size="small" label={item.name} clickable style={{ margin: 2 }} />
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
      pageSize: pageSize,
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
                            <span className="col">{item.slug}</span>
                            <span className="col">{item.url}</span>
                          </div>
                        ))}
                      </ul>
                    </div>
                  );
                }
              }
            ]}
            actions={[
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
    );
  }, [loader, announcements]);
}

const AnnouncementListView = () => {
  const classes = useStyles();

  const [stage, setStage] = useState(STAGE.READY);

  return (
    <StageContext.Provider value={[stage, setStage]}>
      <Page className={classes.root} title="Announcement">
        <Container maxWidth={false}>
          <AnnouncementView />
        </Container>
      </Page>
    </StageContext.Provider>
  );
};

export default AnnouncementListView;
