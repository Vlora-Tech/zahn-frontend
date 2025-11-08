import { FormControl, FormLabel } from "@mui/material";
import InputBlockNoForm, {
  type InputBlockNoFormProps,
} from "../../atoms/InputBlockNoForm";

interface TextFieldBlockNoFormProps extends InputBlockNoFormProps {
  type?: "text" | "email" | "number" | "password" | "date";
  label?: string;
  name: string;
  placeholder?: string;
  readOnly?: boolean;
}

const TextFieldBlockNoForm: React.FC<TextFieldBlockNoFormProps> = ({
  type = "text",
  label,
  placeholder,
  onChange,
  ...props
}) => {
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
      <InputBlockNoForm
        {...props}
        placeholder={placeholder}
        type={type}
        onChange={onChange}
      />
    </FormControl>
  );
};

export default TextFieldBlockNoForm;
