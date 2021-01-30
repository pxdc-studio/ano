/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { Box, Chip, Container, makeStyles } from '@material-ui/core';
import { useTheme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Page from 'src/components/Page';
import { getAllSynonyms, deleteSynonym } from 'src/services/synonymsService';

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
  const [synonyms, setSynonyms] = useState();
  const [loader, setLoader] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedRow, setSelectedRow] = useState(null);

  // Synonyms fetch request function define
  const fetchAllSynonyms = async () => {
    try {
      const { status, data } = await getAllSynonyms();
      if (status === 200) {
        setSynonyms(data);
        setLoader(false);
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setSynonyms([]);
      setLoader(false);
    }
  };

  useEffect(() => {
    // Synonyms fetch request function call
    fetchAllSynonyms();
  }, []);

  // Synonym remove function
  const handleDeleteSynonym = async (id) => {
    const { status } = await deleteSynonym(id);
    if (status === 200) {
      fetchAllSynonyms();
    }
  };

  return (
    <Page className={classes.root} title="Tags">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="Synonyms "
              isLoading={loader}
              columns={[
                { title: 'Name', field: 'slug', render: (dataRow) => dataRow.slug.split('-').join(' ') },
                {
                  title: 'Tags',
                  field: 'tags',
                  render: (dataRow) => {
                    return dataRow.tags.map((tag) => (
                      <Chip key={tag.id} label={tag.slug.split('-').join(' ')} color="secondary" />
                    ));
                  }
                }
              ]}
              data={synonyms}
              editable={{
                onRowDelete: async ({ id }) => {
                  await handleDeleteSynonym(id);
                }
              }}
              // eslint-disable-next-line
              onRowClick={(evt, selectedRow) => setSelectedRow(selectedRow.tableData.id)}
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
              actions={[
                {
                  // custom action for update in new tab
                  icon: 'create',
                  tooltip: 'Update Tags',
                  onClick: (event, rowData) => {
                    const { id, name, slug, tag: tagObj } = rowData;
                    const { id: tag } = tagObj;
                    navigate(
                      `/app/add-synonyms/${id}`,
                      {
                        state: {
                          synonymObj: {
                            name,
                            slug,
                            tag
                          }
                        }
                      },
                      { replace: true }
                    );
                  }
                },
                {
                  // overrides in-built add action in material table
                  icon: 'add',
                  tooltip: 'Add Synonym',
                  position: 'toolbar',
                  isFreeAction: true,
                  onClick: () => {
                    // Routing to Synonym Form on path: /app/add-synonyms/new
                    navigate(
                      `/app/add-synonyms/${'new'}`,
                      {
                        state: {
                          synonymObj: {
                            name: '',
                            slug: '',
                            tag: ''
                          }
                        }
                      },
                      { replace: true }
                    );
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

export default Synonyms;
