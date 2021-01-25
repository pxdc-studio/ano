import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TagForm from 'src/views/tagForm';
import CreateIcon from '@material-ui/icons/Create';
import AddIcon from '@material-ui/icons/Add';

/**
 * path: /NONE
 *      description: Tag Adition Modal
 */

const TagModal = ({ open, isModal, onClose, onOpen, }) => {
    return (
        <>
            <Button variant="outlined" color="primary" startIcon={<CreateIcon />} onClick={onOpen} fullWidth>
            Initialize Tag
            </Button>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Add New Tag
                </DialogTitle>
                <DialogContent>
                    <TagForm isModal={isModal} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary" startIcon={<AddIcon />} autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

TagModal.propTypes = {
    open: PropTypes.bool,
    isModal: PropTypes.bool,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
};

export default TagModal;