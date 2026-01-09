import { useState } from "react";
import S3FileUpload, {
  S3UploadResponse,
} from "../../../components/S3FileUpload";
import { Box } from "@mui/material";

const UploadParameter = ({ accept, label, handleDefineOptionsParameters }) => {
  const [uploadedFile, setUploadedFile] = useState<S3UploadResponse | null>(
    null
  );

  const handleFileUpload = (response: S3UploadResponse) => {
    setUploadedFile(response);

    handleDefineOptionsParameters(response?.url, label);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  return (
    <Box>
      <S3FileUpload
        onUploadSuccess={handleFileUpload}
        onUploadError={(error) => console.error("Upload error:", error)}
        acceptedFileTypes={accept}
        maxFileSize={5 * 1024 * 1024}
        currentFile={uploadedFile}
        onRemove={handleFileRemove}
        label={`Upload ${label} data`}
      />
    </Box>
  );
};

export default UploadParameter;
