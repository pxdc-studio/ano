/* eslint-disable */

import React, { useEffect, useState, useRef } from 'react';
import { Box, Chip, Container, makeStyles } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllSynonyms, deleteSynonym, postSynonym, putSynonyms } from 'src/services/synonymsService';

import { Resources as TagsAutoComplete } from 'src/views/announcement/form.crud';

import { getTagsAutocomplete } from 'src/services/tagsServices';

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

const Synonyms = () => {
  const navigate = useNavigate();
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
    const { status } = await deleteSynonym(id);
    if (status === 200) {
      return true;
    }
    return false;
  };

  const handleUpdateResource = async (newData, oldData) => {
    const { status } = await putSynonyms(newData);
    if (status === 200) {
      return newData;
    }
  };

  const handleAddResource = async (newData, oldData) => {
    const { status, data } = await postSynonym({ synonyms: [newData] });
    if (status === 200 && data.length > 0) {
      newData.id = data[0];
      return newData;
    }
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
                  field: 'slug',
                  render: (dataRow) => <Chip label={dataRow.slug.split('-').join(' ')} />,
                  validate: (rowData) => rowData.slug != null && rowData.slug.length > 0
                },
                {
                  title: 'Tags',
                  field: 'tags',
                  // validate: (rowData) => rowData.tags != null && rowData.tags.length > 0,
                  render: (dataRow) => dataRow.tags.map((tag) => <Chip label={tag} />),
                  editComponent: (props) => (
                    <TagsAutoComplete
                      name="Tags"
                      service={getTagsAutocomplete}
                      ref={tagRef}
                      onChange={(e) => props.onChange(tagRef.current.value)}
                    />
                  )
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
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
};

export default Synonyms;
