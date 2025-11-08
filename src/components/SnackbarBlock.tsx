import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export interface SnackbarBlockProps {
  open: boolean;
  type: 'success' | 'error'
  message: string
  onClose?: () => void
}

const SnackbarBlock: React.FC<SnackbarBlockProps> = ({
  open = false,
  type,
  message,
  onClose
}) => {

  return (
      <Snackbar open={open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal:"right" }} onClose={onClose}>
        <Alert
          severity={type}
          variant="filled"
          sx={{ width: '100%' , borderRadius: "12px" }}
        >
          {message}
        </Alert>
      </Snackbar>
  );
}


export default SnackbarBlock