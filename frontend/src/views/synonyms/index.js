/* eslint-disable */

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Box, Chip, Container, makeStyles } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllSynonyms, deleteSynonym, postSynonym, putSynonyms } from 'src/services/synonymsService';
import TagIcon from '@material-ui/icons/Bookmark';
import TagsIcon from '@material-ui/icons/Bookmarks';

import { AutocompleteByTagName } from './tags.autocomplete';
/**
 * path: /app/synonyms
 *      description: synonyms CRUD
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

export default () => {
  const classes = useStyles();
  const theme = useTheme();
  const [loader, setLoader] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedRow, setSelectedRow] = useState(null);
  const tagRef = useRef();

  async function fetchAllResources(query) {
    try {
      let { status, data } = await getAllSynonyms({
        pageSize: query.pageSize,
        page: query.page
      });

      //cleanup before use, or it will messup our system
      data.data = data.data.map((item) => {
        item.tags = item.tags.map((tag) => tag.tag); // this is due to sql return nesting object
        return item;
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

  // Resources remove function
  const handleDeleteResource = async ({ id }) => {
    const { data } = await deleteSynonym(id);
    let { status, message } = data;
    if (status === 200) {
      toast.success(message);
      return true;
    }
    toast.error(message);
    return false;
  };

  const handleUpdateResource = async (value, oldData) => {
    const { data } = await putSynonyms(value);
    const { status, message } = data;
    if (status === 200) {
      toast.success(message);
      return value;
    }
    return false;
  };

  const handleAddResource = async (newData, oldData) => {
    const { data } = await postSynonym(newData);
    const { status, message } = data;
    if (status == 200) {
      toast.success(message);
      return newData;
    }

    toast.error(message);
  };

  return (
    <Page className={classes.root} title="Tags">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="Synonyms"
              isLoading={loader}
              columns={[
                {
                  title: 'Synonym',
                  field: 'name',
                  validate: (rowData) => rowData.name != null && rowData.name.length > 0
                },
                {
                  title: 'Slug',
                  field: 'slug',
                  render: (dataRow) => (
                    <Chip icon={<TagsIcon />} label={dataRow.slug} size="small" style={{ margin: 2 }} />
                  ),
                  editable: 'never'
                },
                {
                  title: 'Tags',
                  field: 'tags',
                  render: (dataRow) =>
                    dataRow.tags.map((tag, index) => (
                      <Chip icon={<TagIcon />} key={index} label={tag.slug} size="small" style={{ margin: 2 }} />
                    )),
                  editComponent: (props) => {
                    return <AutocompleteByTagName ref={tagRef} tableProps={props} />;
                  },
                  validate: (rowData) => rowData.tags != null && rowData.tags.length > 0
                }
              ]}
              data={fetchAllResources}
              editable={{
                onRowAdd: handleAddResource,
                onRowUpdate: handleUpdateResource,
                onRowDelete: handleDeleteResource
              }}
              // eslint-disable-next-line
              onRowClick={(evt, selectedRow) => setSelectedRow(selectedRow.tableData.id)}
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
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
};
