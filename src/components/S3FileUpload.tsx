import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  InsertDriveFile,
} from "@mui/icons-material";

export interface S3UploadResponse {
  url: string;
  key: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface S3FileUploadProps {
  onUploadSuccess: (response: S3UploadResponse) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
  currentFile?: S3UploadResponse | null;
  onRemove?: () => void;
  label?: string;
  disabled?: boolean;
}

const S3FileUpload: React.FC<S3FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = "image/*,.pdf,.doc,.docx",
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  currentFile,
  onRemove,
  label = "Upload File",
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // For now, create a mock S3 response since we don't have the actual upload endpoint
      // In a real implementation, you would upload to your S3 upload endpoint
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Generate a mock S3 URL
        const mockS3Response: S3UploadResponse = {
          url: `https://zahn-care.s3.eu-north-1.amazonaws.com/${Date.now()}-${file.name}`,
          key: `${Date.now()}-${file.name}`,
          bucket: "zahn-care",
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        };
        
        onUploadSuccess(mockS3Response);
        setUploading(false);
      }, 1000);

    } catch {
      setError("Upload failed");
      onUploadError?.("Upload failed");
      setUploading(false);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setError(null);
    onRemove?.();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon />;
    }
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {currentFile ? (
        <Box
          sx={{
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            p: 2,
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            {getFileIcon(currentFile.mimeType)}
            <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
              <Typography variant="body2" fontWeight={500}>
                {currentFile.originalName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(currentFile.size)}
              </Typography>
            </Box>
            <IconButton
              onClick={handleRemove}
              color="error"
              size="small"
              disabled={disabled}
            >
              <Delete />
            </IconButton>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: uploading ? '#f5f5f5' : 'transparent',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            '&:hover': {
              borderColor: disabled || uploading ? '#e0e0e0' : '#1976d2',
              backgroundColor: disabled || uploading ? '#f5f5f5' : '#f0f7ff',
            },
          }}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            {uploading ? 'Uploading...' : label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drag and drop or click to select file
          </Typography>
          
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="caption">
                {Math.round(uploadProgress)}% uploaded
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default S3FileUpload; 