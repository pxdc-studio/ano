/* eslint-disable */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Container, TextField, makeStyles, Chip } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import Page from 'src/components/Page';
import { getAllTags, postTag, putTag, deleteTag } from 'src/services/tagsServices';

import Context from './context';
import { STAGE } from './data';

/**
 * path: /app/tags
 *      description: tags CRUD
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
  input: {
    '& .MuiTextField-root': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
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

const Tags = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  const classes = useStyles();
  const [selectedRow, setSelectedRow] = useState(null);

  const theme = useTheme();

  async function fetchAllResources(query) {
    try {
      let { status, data } = await getAllTags({
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
    const { status } = await deleteTag(id);
    if (status === 200) {
      return true;
    }
    return false;
  };

  const handleUpdateResource = async (newData, oldData) => {
    const { status } = await putTag(newData);
    if (status === 200) {
      return newData;
    }
  };

  const handleAddResource = async (newData, oldData) => {
    const { status, data } = await postTag({ tags: [newData] });
    if (status === 200 && data.length > 0) {
      newData.id = data[0];
      return newData;
    }
  };

  return useMemo(() => {
    return (
      <Page className={classes.root} title="Tags">
        <Container maxWidth={false}>
          <Box mt={3}>
            <MuiThemeProvider theme={themeTable}>
              <MaterialTable
                title="Tags"
                isLoading={loader}
                columns={[
                  {
                    title: 'Tag',
                    field: 'slug',
                    render: (dataRow) => <Chip label={dataRow.slug.split('-').join(' ')} />,
                    validate: (rowData) => rowData.slug != null && rowData.slug.length > 0
                  }
                  // { title: 'Url', field: 'url', validate: (rowData) => rowData.url != null && rowData.url.length > 0 }
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
  }, [loader]);
};

export default Tags;
