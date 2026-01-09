import { FormControl, FormLabel } from "@mui/material";
import { useField } from "formik";
import InputBlock, { type InputBlockProps } from "../../atoms/InputBlock";

interface TextFieldBlockProps extends InputBlockProps {
  type?: "text" | "email" | "number" | "password" | "date";
  label?: string;
  name: string;
  placeholder?: string;
  readOnly?: boolean;
}

const TextFieldBlock: React.FC<TextFieldBlockProps> = ({
  type = "text",
  label,
  name,
  placeholder,
  ...props
}) => {
  const [field, meta] = useField(name);

  return (
    <FormControl
      fullWidth
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {label && (
        <FormLabel
          sx={{
            fontWeight: "400",
            fontSize: "14px",
            color: "rgba(10, 77, 130, 1)",
          }}
        >
          {label}
        </FormLabel>
      )}
      <InputBlock
        {...field}
        placeholder={placeholder}
        type={type}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        // readOnly={readOnly}
        {...props}
      />
    </FormControl>
  );
};

export default TextFieldBlock;
