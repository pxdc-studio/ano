import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

const AlertMessage = ({ open, onOpen, onClose, onLogout }) => {
  return (
    <div>
      <Button variant="outlined" color="primary" onClick={onOpen}>
        Open alert dialog
      </Button>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure to Logout ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onLogout} color="primary">
            yes
          </Button>
          <Button onClick={onClose} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

AlertMessage.propTypes = {
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onLogout: PropTypes.func
};

export default AlertMessage;