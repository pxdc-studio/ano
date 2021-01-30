import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

const Modal = ({
  open,
  onClose,
  fullWidth,
  title,
  type,
  textConfirm,
  onConfirm,
  textCancel,
  onCancel,
  children,
  ...props
}) => {
  return (
    <Dialog {...props} open={open} onClose={onClose} fullWidth={fullWidth}>
      {title && <DialogTitle>{title}</DialogTitle>}

      <DialogContent>{children}</DialogContent>

      {type === 'action' && (
        <DialogActions>
          <Button onClick={onCancel} color="secondary">
            {textCancel || 'Cancel'}
          </Button>

          <Button onClick={onConfirm} color="primary">
            {textConfirm || 'Agree'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
