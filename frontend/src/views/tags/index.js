import React, { useMemo, useState } from 'react';
import { Box, Container, makeStyles, Chip } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { toast } from 'react-toastify';

import Page from 'src/components/Page';
import { getAllTags, postTag, putTag, deleteTag } from 'src/services/tagsServices';
import TagIcon from '@material-ui/icons/Bookmark';

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

export default () => {
  const classes = useStyles();

  const [loader, setLoader] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  const theme = useTheme();

  async function fetchAllResources(query) {
    try {
      const { status, data } = await getAllTags({
        pageSize: query.pageSize,
        page: query.page
      });

      if (status === 200) {
        setLoader(false);

        return data;
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setLoader(false);
    }
  }

  const handleDeleteResource = async ({ id }) => {
    const { data } = await deleteTag(id);
    const { status, message } = data;

    if (status === 200) {
      toast.success(message);
      return true;
    }
    toast.error(message);
  };

  const handleUpdateResource = async (newData) => {
    const { data } = await putTag(newData);
    const { status, message } = data;
    if (status === 200) {
      toast.success(message);
      return newData;
    }
    toast.error(message);
  };

  const handleAddResource = async (newData) => {
    const { data } = await postTag(newData);
    const { status, message } = data;
    if (status === 200) {
      toast.success(message);
      return newData;
    }
    toast.error(message);
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
                    title: 'Name',
                    field: 'name',
                    validate: (rowData) => rowData.name != null && rowData.name.length > 0
                  },
                  {
                    title: 'Slug',
                    field: 'slug',
                    render: (dataRow) => (
                      <Chip icon={<TagIcon />} label={dataRow.slug} style={{ margin: 2 }} size="small" />
                    ),
                    editable: 'never'
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
