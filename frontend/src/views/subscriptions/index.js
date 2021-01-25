import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  makeStyles,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, RotateCw as ResetIcon } from 'react-feather';
import Page from 'src/components/Page';
import { getAllSubscriptions, deleteSubscription, getFilterData } from 'src/services/subscriptionService';
import { toast } from 'react-toastify';
/**
 * path: /app/subscriptions
 *      description: subscriptions CRUD
 */

// Styles for root component
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(20)

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

const Subs = () => {
  const initalSubsValues = {
    authStatus: 'author.name_eq',
    authorName: '',
    tagStatus: 'tag.name_eq',
    tagName: ''
  };
  const navigate = useNavigate();
  const classes = useStyles();
  const theme = useTheme();
  const [subscriptions, setSubscriptions] = useState();
  const [loader, setLoader] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedRow, setSelectedRow] = useState(null);
  const [queryObj, setQueryObj] = useState(initalSubsValues);
  // Subscription fetch request function define
  const fetchAllSubscriptions = async () => {
    try {
      const { status, data } = await getAllSubscriptions();
      if (status === 200) {
        setSubscriptions(data);
        setLoader(false);
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setSubscriptions([]);
      setLoader(false);
    }
  };
  //Filtered data bilding function 
  const handleChange = ({ target: { name, value } }) => {
    setQueryObj({ ...queryObj, [name]: value });
  };
  //Filtered Query Param Service Call
  const handleSubmitFiltered = async () => {
    try {
      const { status, data } = await getFilterData(queryObj);
      if (status === 200) {
        setSubscriptions(data);
      }
    } catch (ex) {
      toast.error('Your Seach Value is ', ex.response);
    }
  };

  //Filtered Input values Reset Values
  const handleReset = () => {
    setQueryObj(initalSubsValues);
    fetchAllSubscriptions();
  };

  useEffect(() => {
    // Announcements fetch request function call
    fetchAllSubscriptions();
  }, []);

  // Subscription remove function define
  const handleDeleteSubscription = async (id) => {
    const { status } = await deleteSubscription(id);
    if (status === 200) {
      fetchAllSubscriptions();
    }
  };

  return (
    <Page
      className={classes.root}
      title="Tags"
    >
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
              <Grid item>
                <Box mb={2}>
                  <TextField
                    name="authorName"
                    value={queryObj.authorName}
                    onChange={handleChange}
                    label="Author Name"
                    size="medium" />
                </Box>
              </Grid>
              <Grid item>
                <Box mb={2}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Tags Status</InputLabel>
                    <Select
                      name="authStatus"
                      value={queryObj.authStatus}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value={'author.name_eq'}>Contain</MenuItem>
                      <MenuItem value={'author.name_ne'}>Not Contain</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item>
                <Box mb={2}>
                  <TextField
                    name="tagName"
                    value={queryObj.tagName}
                    onChange={handleChange}
                    label="Tag Name"
                    size="medium" />
                </Box>
              </Grid>
              <Grid item>
                <Box mb={2}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Authors Satus</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      name="tagStatus"
                      value={queryObj.tagStatus}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value={'tag.name_eq'}>Contain</MenuItem>
                      <MenuItem value={'tag.name_ne'}>Not Contain</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item>
                <Box mb={2}>
                  <Button color="primary" variant="contained" onClick={handleSubmitFiltered} endIcon={<SearchIcon />}>Search </Button>
                </Box>
              </Grid>
              <Grid item>
                <Box mb={2}>
                  <Button color="primary" variant="contained" onClick={handleReset} endIcon={<ResetIcon />}>Reset </Button>
                </Box>
              </Grid>
            </Grid>
            <MaterialTable
              title="Subscriptions "
              isLoading={loader}
              columns={[
                { title: 'ID', field: 'id', editable: 'never' },
                { title: 'Digest', field: 'digest' },
                { title: 'Authors', field: 'author.name' },
                { title: 'Tags', field: 'tag.name' },
              ]}
              data={subscriptions}
              editable={{
                onRowDelete: async ({ id }) => {
                  await handleDeleteSubscription(id);
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
                  tooltip: 'Update Subscriptions',
                  onClick: (event, rowData) => {
                    const { id, digest, author: authorObj, tag: tagObj } = rowData;
                    const { id: author } = authorObj;
                    const { id: tag } = tagObj;
                    navigate(`/app/add-subscriptions/${id}`, {
                      state: {
                        subscribeObj: {
                          digest,
                          author,
                          tag
                        }
                      }
                    }, { replace: true });
                  }
                },
                { // overrides in-built add action in material table
                  // Announcement routing to Subcription Form path: /app/add-subscriptions/new
                  icon: 'add',
                  tooltip: 'Add Subscription',
                  position: 'toolbar',
                  isFreeAction: true,
                  onClick: () => {
                    navigate(`/app/add-subscriptions/${'new'}`, {
                      state: {
                        subscribeObj: {
                          digest: '',
                          author: '',
                          tag: ''
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

export default Subs;
