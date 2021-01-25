import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  makeStyles,
} from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllResources, deleteResource } from 'src/services/resourcesService';

/**
 * path: /app/resources
 *      description: resources CRUD
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

const Resources = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const theme = useTheme();
  const [resources, setResources] = useState();
  const [loader, setLoader] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedRow, setSelectedRow] = useState(null);
  // Resources fetch request function define
  const fetchAllResources = async () => {
    try {
      const { status, data } = await getAllResources();
      if (status === 200) {
        setResources(data);
        setLoader(false);
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setResources([]);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchAllResources();
    // Resources fetch request function called
  }, []);

  // Resources remove function
  const handleDeleteResource = async (id) => {
    const { status } = await deleteResource(id);
    if (status === 200) {
      fetchAllResources();
    }
  };

  return (
    <Page
      className={classes.root}
      title="Resources"
    >
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="Resources "
              isLoading={loader}
              columns={[
                { title: 'ID', field: 'id', editable: 'never' },
                { title: 'Name', field: 'name' },
                { title: 'Url', field: 'url' },
                { title: 'Announcement', field: 'announcement_id.title' },
              ]}
              data={resources}
              editable={{
                onRowDelete: async ({ id }) => {
                  await handleDeleteResource(id);
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
                { // custom action for update in new tabaaa
                  icon: 'create',
                  tooltip: 'Update Announcement',
                  onClick: (event, rowData) => {
                    const { id, name, url, announcement_id: announObj } = rowData;
                    const { id: announId } = announObj;
                    navigate(`/app/add-resources/${id}`, {
                      state: {
                        resourceObj: {
                          name,
                          url,
                          announId
                        }
                      }
                    }, { replace: true });
                  }
                },
                { // overrides in-built add action in material table
                  icon: 'add',
                  tooltip: 'Add Resources',
                  position: 'toolbar',
                  isFreeAction: true,
                  onClick: () => {
                    // Routing to Resources Form on /app/add-resources/new
                    navigate(`/app/add-resources/${'new'}`, {
                      state: {
                        resourceObj: {
                          name: '',
                          url: '',
                          announId: ''
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

export default Resources;
