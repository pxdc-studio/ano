import React, { useState } from 'react';
import { Box, Container, makeStyles, Chip, Typography, useTheme } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Page from 'src/components/Page';
import { toast } from 'react-toastify';

import MaterialTable from 'material-table';
import FaceIcon from '@material-ui/icons/Face';
import TagIcon from '@material-ui/icons/Bookmark';
import TagsIcon from '@material-ui/icons/Bookmarks';

import { AutocompleteByAuthor } from 'src/components/autocomplete/authors.autocomplete';
import { AutocompleteByTagName } from 'src/components/autocomplete/tags.autocomplete';
import { AutocompleteSynonymByName } from 'src/components/autocomplete/synonyms.autocomplete';

import {
  getAllSubscriptions,
  putSubscription,
  postSubscription,
  deleteSubscription
} from 'src/services/subscriptionService';
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

export default function Subscriptions() {
  const classes = useStyles();

  const [loader, setLoader] = useState(false);
  // eslint-disable-next-line no-unused-vars

  const theme = useTheme();

  async function fetchAllSubscriptions() {
    try {
      const { data } = await getAllSubscriptions();
      return data;
    } catch (ex) {
      toast.error(ex.response.data.message);
      setLoader(false);
    }
  }

  async function handleDeleteResource({ id }) {
    try {
      const { data } = await deleteSubscription(id);
      const { status, message } = data;

      if (status === 200) {
        toast.success(message);
        return true;
      }
      toast.error(message);
    } catch (er) {
      toast.error('Server Error');
    }
  }

  async function handleUpdateResource(values) {
    try {
      const { data } = await putSubscription(values);
      const { status, message } = data;

      if (status === 200) {
        toast.success(message);
        return true;
      }
      toast.error(message);
    } catch (er) {
      toast.error('Server Error');
    }
  }

  async function handleAddResource(values) {
    try {
      const { data } = await postSubscription(values);
      const { status, message } = data;

      if (status === 200) {
        toast.success(message);
        return true;
      }
      toast.error(message);
    } catch (er) {
      toast.error('Server Error');
    }
  }

  function mapDynamicType(r) {
    if (!r?.tag && !r?.author && !r?.synonym) return;
    if (r.__component === 'subscriptions.tags') {
      return <Chip icon={<TagIcon />} key={r.tag.id} label={r.tag.name} size="small" style={{ margin: 2 }} />;
    }

    if (r.__component === 'subscriptions.synonyms') {
      return <Chip icon={<TagsIcon />} key={r.synonym.id} label={r.synonym.name} size="small" style={{ margin: 2 }} />;
    }

    if (r.__component === 'subscriptions.authors') {
      return (
        <Chip icon={<FaceIcon />} key={r.author.id} label={r.author.username} size="small" style={{ margin: 2 }} />
      );
    }
    return null;
  }

  const COLUMNS = [
    {
      title: 'Includes',
      field: 'includes',
      render: (rowData) => rowData.includes.map(mapDynamicType),
      editComponent: (props) => {
        return <EditBox {...props} name="Includes" rowData={props} hash="includes" />;
      }
    },
    {
      title: 'Excludes',
      field: 'excludes',
      render: (rowData) => rowData.excludes.map(mapDynamicType),
      editComponent: (props) => {
        return <EditBox {...props} name="Excludes" rowData={props} hash="excludes" />;
      }
    },
    {
      title: 'Digest',
      field: 'digest',
      lookup: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' },
      initialEditValue: 'daily'
    }
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
    }
  };

  return (
    <Page className={classes.root} title="Subcriptions">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="My Subcriptions"
              isLoading={loader}
              editable={{
                onRowAdd: handleAddResource,
                onRowUpdate: handleUpdateResource,
                onRowDelete: handleDeleteResource
              }}
              columns={COLUMNS}
              data={fetchAllSubscriptions}
              options={OPTIONS}
            />
          </MuiThemeProvider>
        </Box>
        <Typography component="div" style={{ marginTop: 16 }}>
          <h5>Types of Subcriptions</h5>
          <Box p={1}>
            <Chip icon={<FaceIcon />} label="Author" size="small" style={{ margin: 2 }} />
            <Chip icon={<TagIcon />} label="Tag" size="small" style={{ margin: 2 }} />
            <Chip icon={<TagsIcon />} label="Synonym" size="small" style={{ margin: 2 }} />
          </Box>
        </Typography>
      </Container>
    </Page>
  );
}

function EditBox({ name, rowData, hash }) {
  //Map Data From Autocompete back to rowData
  function onTagChange(values) {
    if (!rowData.rowData[hash]) {
      rowData.rowData[hash] = [];
    }
    let row = rowData.rowData[hash].filter((item) => item.__component !== 'subscriptions.tags');
    row = row.concat(values.map((data) => ({ __component: 'subscriptions.tags', tag: data })));
    rowData.onRowDataChange({
      ...rowData.rowData,
      [hash]: row
    });
  }

  function onAuthorChange(values) {
    if (!rowData.rowData[hash]) {
      rowData.rowData[hash] = [];
    }
    let row = rowData.rowData[hash].filter((item) => item.__component !== 'subscriptions.authors');
    row = row.concat(values.map((data) => ({ __component: 'subscriptions.authors', author: data })));
    rowData.onRowDataChange({
      ...rowData.rowData,
      [hash]: row
    });
  }

  function onSynonymChange(values) {
    if (!rowData.rowData[hash]) {
      rowData.rowData[hash] = [];
    }
    let row = rowData.rowData[hash].filter((item) => item.__component !== 'subscriptions.synonyms');
    row = row.concat(values.map((data) => ({ __component: 'subscriptions.synonyms', synonym: data })));
    rowData.onRowDataChange({
      ...rowData.rowData,
      [hash]: row
    });
  }

  let tags;
  let authors;
  let synonyms;

  if (rowData && rowData.rowData[hash]) {
    tags = rowData.rowData[hash].filter((item) => item.__component === 'subscriptions.tags').map((item) => item.tag);
    authors = rowData?.rowData[hash]
      .filter((item) => item.__component === 'subscriptions.authors')
      .map((item) => item.author);
    synonyms = rowData?.rowData[hash]
      .filter((item) => item.__component === 'subscriptions.synonyms')
      .map((item) => item.synonym);
  }

  return (
    <Box p={2}>
      <h4>{name}</h4>
      <Box mt={2}>
        <AutocompleteByTagName onChange={onTagChange} value={tags} creatable={false} />
      </Box>
      <Box mt={2}>
        <AutocompleteByAuthor onChange={onAuthorChange} value={authors} />
      </Box>
      <Box mt={2}>
        <AutocompleteSynonymByName onChange={onSynonymChange} value={synonyms} />
      </Box>
    </Box>
  );
}
