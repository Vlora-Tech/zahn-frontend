import React, { createContext, useContext, useState, ReactNode } from 'react';
import SnackbarBlock, { SnackbarBlockProps } from '../components/SnackbarBlock';
import { SnackbarCloseReason } from '@mui/material';

// Define the options for opening a snackbar
interface SnackbarOptions {
  type: 'success' | 'error';
  message: string;
}

// Context interface
interface SnackbarContextProps {
  openSnackbar: (options: SnackbarOptions) => void;
}

// Create context with undefined default value
const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

// Props for the provider component
interface SnackbarProviderProps {
  children: ReactNode;
}

// Provider component
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  // State to control the snackbar properties
  const [snackbarProps, setSnackbarProps] = useState<SnackbarBlockProps>({
    open: false,
    type: 'success',
    message: '',
  });

  // Function to open the snackbar
  const openSnackbar = (options: SnackbarOptions) => {
    setSnackbarProps({
      open: true,
      type: options.type,
      message: options.message,
    });
  };

  // Function to close the snackbar
  const closeSnackbar = (_?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarProps((prevState) => ({ ...prevState, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar }}>
      {children}
      <SnackbarBlock
        open={snackbarProps.open}
        type={snackbarProps.type}
        message={snackbarProps.message}
        onClose={closeSnackbar}
      />
    </SnackbarContext.Provider>
  );
};

// Custom hook to use the snackbar
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  
  return context;
};