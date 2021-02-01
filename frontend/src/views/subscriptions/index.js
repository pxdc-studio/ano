/* eslint-disable */
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
  MenuItem,
  Chip,
  Avatar,
  Popover,
  Typography
} from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, RotateCw as ResetIcon } from 'react-feather';
import Page from 'src/components/Page';
import { getAllSubscriptions, deleteSubscription, getFilterData } from 'src/services/subscriptionService';
import { toast } from 'react-toastify';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AddIcon from '@material-ui/icons/Add';

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
  const [subscriptions, setSubscriptions] = useState(null);
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
        console.log(data);
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

  const top100Films = [
    { title: 'Mr A', year: 1994 },
    { title: 'Mr B', year: 1972 },
    { title: 'Mrs C', year: 1974 }
  ];

  function _handleSubmit() {}

  const validation = Yup.object().shape({
    title: Yup.string().max(80).required('Title is required'),
    message: Yup.string().max(280).required('Message is required')
  });

  function Form({ errors, handleBlur, handleChange, handleSubmit, isSubmitting }) {
    return (
      <>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <Typography color="textPrimary" variant="h2">
              Subscription
            </Typography>
          </Box>
          {/* <Autocomplete
            id="tags-outlined"
            options={top100Films}
            getOptionLabel={(option) => option.title}
            defaultValue={[top100Films[1]]}
            filterSelectedOptions
            multiple
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                return <ChipWithPopper {...getTagProps({ index })} label={option.title} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Subcribed Author" placeholder="Tags" />
            )}
          /> */}

          <br />
          <Autocomplete
            options={subscriptions ? subscriptions.tags : []}
            getOptionLabel={(option) => option.tag.slug}
            value={subscriptions ? subscriptions.tags : []}
            multiple
            filterSelectedOptions
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                if (option.exclude_authors) {
                  return (
                    <ChipWithPopper {...getTagProps({ index })} label={option.tag.slug} data={option.exclude_authors} />
                  );
                }
              })
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Subcribed Tags" placeholder="Tags" />
            )}
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
              Update
            </Button>
          </Box>
        </form>
      </>
    );
  }

  return (
    <Page className={classes.root} title="Tags">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <Formik validationSchema={validation} onSubmit={_handleSubmit} initialValues={{}}>
              {Form}
            </Formik>
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
};

function ChipWithPopper({ data, ...props }) {
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

  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div style={{ display: 'inline-block' }}>
          <Chip
            size="small"
            avatar={<Avatar>M</Avatar>}
            label="Author Name"
            onClick={handleClick}
            onDelete={handleDelete}
            {...bindTrigger(popupState)}
            {...props}
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
                options={data}
                getOptionLabel={(option) => option.title}
                value={data}
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

export default Subs;
