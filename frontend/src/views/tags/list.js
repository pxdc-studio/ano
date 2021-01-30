/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import { Box, Container, TextField, makeStyles } from '@material-ui/core';
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

  const classes = useStyles();

  const theme = useTheme();

  const [state, setState] = useContext(Context);

  const [tags, setTags] = useState();
  const [loader, setLoader] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedRow, setSelectedRow] = useState(null);

  // Tags fetch request function define
  const fetchAllTags = async () => {
    try {
      const { status, data } = await getAllTags();

      if (status === 200) {
        setTags(data);
        setLoader(false);
      }
    } catch (ex) {
      toast.error(ex.response.data.message);
      setTags([]);
      setLoader(false);
    }
  };

  // const createTag = () => {
  //   // setLoader(true);

  //   postTag(stage.payload)
  //     .then((res) => {
  //       console.log(res.data);
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     })
  //     .finally(() => {
  //       setLoader(false);

  //       setStage({ ...stage, value: STAGE.RESET, payload: null });
  //     });

  //   // try {
  //   //   const { status, data } = await getAllTags();

  //   //   if (status === 200) {
  //   //     setTags(data);
  //   //     setLoader(false);
  //   //   }
  //   // } catch (ex) {
  //   //   toast.error(ex.response.data.message);
  //   //   setTags([]);
  //   //   setLoader(false);
  //   // }
  // };

  useEffect(() => {
    // Tags fetch request function call
    fetchAllTags();
  }, []);

  // Tag remove function
  const handleDeleteTag = async (id) => {
    const { status } = await deleteTag(id);
    if (status === 200) {
      fetchAllTags();
    }
  };

  return (
    <Page className={classes.root} title="Tags">
      <Container maxWidth={false}>
        <Box mt={3}>
          <MuiThemeProvider theme={themeTable}>
            <MaterialTable
              title="Tags"
              isLoading={loader}
              columns={[
                { title: 'ID', field: 'id', editable: 'never' },
                // { title: 'Name', field: 'name', render: (row) => row.slug.split('-').join(' ') },
                { title: 'Slug', field: 'slug' },
                {
                  title: 'Author',
                  field: 'author',
                  render: (row) => `${row.author?.firstname} ${row.author?.lastname}`
                }
                // { title: 'Announcement', field: 'announcement_id.title' },
              ]}
              data={tags}
              editable={{
                onRowDelete: async ({ id }) => {
                  await handleDeleteTag(id);
                }
              }}
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
                    setState(update(state, { stage: { $set: STAGE.EDIT_TAG }, form: { $set: rowData } }));
                  }
                },
                {
                  // overrides in-built add action in material table
                  icon: 'add',
                  tooltip: 'Add Tag',
                  position: 'toolbar',
                  isFreeAction: true,
                  onClick: () => setState(update(state, { stage: { $set: STAGE.ADD_TAG } }))
                }
              ]}
            />
          </MuiThemeProvider>
        </Box>
      </Container>
    </Page>
  );
};

export default Tags;
