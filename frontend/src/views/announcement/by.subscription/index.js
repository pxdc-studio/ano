/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, makeStyles, Chip, Avatar, Popover, TextField, Modal, Backdrop, Fade } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import Page from 'src/components/Page';
import { getAllAnnouncements } from 'src/services/announcementService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Label, Explicit } from '@material-ui/icons';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CreateForm from '../form.crud';
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

const AnnouncementListView = () => {
  const classes = useStyles();

  const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 }
  ];

  const [stage, setStage] = useState(STAGE.READY);

  return (
    <Page className={classes.root} title="Announcement">
      <Container maxWidth={false}>
        <AddAnnouncement show={stage == STAGE.CREATE} />
        <Autocomplete
          id="tags-outlined"
          options={top100Films}
          getOptionLabel={(option) => option.title}
          defaultValue={[top100Films[1]]}
          filterSelectedOptions
          renderTags={(value, getTagProps) => {
            return value.map((option, index) => {
              return (
                <div>
                  <Chip {...getTagProps({ index })} />
                </div>
              );
              // <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            });
          }}
          renderInput={(params) => <TextField {...params} variant="filled" label="filter" placeholder="Favorites" />}
        />
        <div className={classes.tags}>
          <PoppeChip />
        </div>
        <Subcriptions />
      </Container>
    </Page>
  );
};

function AddAnnouncement({ show }) {
  const classes = useStyles();
  // const navigate = useNavigate();

  function evtClose() {
    // navigate(`/announcements`, { replace: true });
  }

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
          <CreateForm />
        </div>
      </Fade>
    </Modal>
  );
}

// eslint-disable-next-line no-unused-vars
function Subcriptions() {
  const [loader, setLoader] = useState(true);
  const [announcements, setAnnouncements] = useState();
  const [selectedRow, setSelectedRow] = useState();
  const navigate = useNavigate();
  const theme = useTheme();
  const classes = useStyles();

  useEffect(() => {
    async function fetchAnnouncements() {
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
    }
    fetchAnnouncements();
  }, []);

  return useMemo(() => {
    function addNewAnnouncement() {
      navigate(`/announcements/add`, { replace: true });
    }

    const COLUMNS = [
      { title: 'Title', field: 'title' },
      // { title: 'Message', field: 'message' },
      {
        title: 'Author',
        field: 'author.firstname',
        editable: 'never',
        render: (o) => `${o.author.firstname} ${o.author.lastname}`
      },
      {
        title: 'Post Date',
        field: 'postdate',
        render: (rowData) => moment(rowData.postdate).format('MM-DD-YYYY'),
        editable: 'never'
      },
      {
        title: 'Tags & Synonyms',
        render: (rowData) => {
          return rowData.tags.map((item) => (
            <Chip
              size="small"
              label={item.slug.split('-').join(' ')}
              clickable
              color="primary"
              style={{ margin: '4px' }}
            />
          ));
        },
        editable: 'never'
      }
    ];

    const OPTIONS = {
      actionsColumnIndex: -1,
      search: false,
      filtering: false,
      paging: true,
      pageSize: 10,
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

    const ACTIONS = [
      {
        icon: 'add',
        tooltip: 'Add Announcement',
        position: 'toolbar',
        isFreeAction: true,
        onClick: addNewAnnouncement
      }
    ];

    return (
      <Box mt={4}>
        <MuiThemeProvider theme={themeTable}>
          <MaterialTable
            title="Timeline"
            isLoading={loader}
            data={announcements}
            // eslint-disable-next-line
            onRowClick={(evt, _selectedRow) => setSelectedRow(_selectedRow.tableData.id)}
            columns={COLUMNS}
            options={OPTIONS}
            actions={ACTIONS}
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
          />
        </MuiThemeProvider>
      </Box>
    );
  }, [loader, announcements]);
}

function PoppeChip(props) {
  const classes = useStyles();

  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  const handleClick = () => {
    console.info('You clicked the Chip.');
  };

  const top100Films = [
    { title: 'Mr A', year: 1994 },
    { title: 'Mr B', year: 1972 },
    { title: 'Mrs C', year: 1974 }
  ];

  function ChipType({ type, state }) {
    if (type === 'author') {
      return (
        <Chip
          size="small"
          avatar={<Avatar>M</Avatar>}
          label="Author Name"
          onClick={handleClick}
          onDelete={handleDelete}
          {...bindTrigger(state)}
          {...props}
        />
      );
    }
  }

  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div style={{ display: 'inline-block' }}>
          <ChipType type="author" state={popupState} />
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <Box p={2} className={classes.tags_popper}>
              <Autocomplete
                multiple
                id="size-small-standard-multi"
                size="small"
                options={top100Films}
                getOptionLabel={(option) => option.title}
                defaultValue={[top100Films[0]]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Excludes From Author"
                    placeholder="Tags or Synonyms"
                  />
                )}
              />
            </Box>
          </Popover>
        </div>
      )}
    </PopupState>
  );
}

function PoppeChip2() {
  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  const top100Films = [
    { title: 'Mr A', year: 1994 },
    { title: 'Mr B', year: 1972 },
    { title: 'Mrs C', year: 1974 }
  ];

  const classes = useStyles();

  function ChipType({ type, state }) {
    if (type === 'author') {
      return (
        <Chip
          size="small"
          label="Vehicle"
          color="primary"
          onDelete={handleDelete}
          icon={<Label />}
          {...bindTrigger(state)}
          style={{ position: 'relative' }}
        />
      );
    }
  }

  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div style={{ display: 'inline-block' }}>
          {/* <ChipType type="author" state={popupState} /> */}
          <Chip
            size="small"
            label="Vehicle"
            color="primary"
            onDelete={handleDelete}
            icon={<Label />}
            {...bindTrigger(popupState)}
            style={{ position: 'relative' }}
          />
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <Box p={2} className={classes.tags_popper}>
              <Autocomplete
                multiple
                id="size-small-standard-multi"
                size="small"
                options={top100Films}
                getOptionLabel={(option) => option.title}
                defaultValue={[top100Films[0]]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Excludes From Author"
                    placeholder="Tags or Synonyms"
                  />
                )}
              />
            </Box>
          </Popover>
        </div>
      )}
    </PopupState>
  );
}

export default AnnouncementListView;