import React, { useContext } from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import update from 'immutability-helper';

import Modal from 'src/components/Modal';

import Context from './context';
import { STAGE } from './data';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  }
}));

const Form = () => {
  const classes = useStyles();

  const [state, setState] = useContext(Context);

  const open = [STAGE.ADD_TAG, STAGE.EDIT_TAG].includes(state.stage);

  const onClose = () => setState(update(state, { stage: { $set: STAGE.RESET }, form: { $set: null } }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      onCancel={onClose}
      // onConfirm={createTag}
      fullWidth
      title="Create New Tag"
      type="action"
    >
      <div className={classes.root}>
        <TextField
          label="Slug"
          variant="outlined"
          fullWidth
          value={state.form?.slug || ''}
          // onChange={(e) => setState(update(state, { form: { slug: { $set: e.target.value } } }))}
        />
      </div>
    </Modal>
  );
};

export default Form;
