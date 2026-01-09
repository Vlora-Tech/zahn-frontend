import { FormControl, FormLabel } from "@mui/material";
import { useField } from "formik";
import SelectBlock from "../../atoms/SelectBlock";

interface SelectFieldBlockProps {
  label?: string;
  name: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  disabled?: boolean;
  enableClear?: boolean;
}

const SelectFieldBlock: React.FC<SelectFieldBlockProps> = ({
  label,
  name,
  options,
  placeholder,
  disabled,
  enableClear,
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
      <SelectBlock
        {...field}
        enableClear={enableClear}
        disabled={disabled}
        placeholder={placeholder}
        options={options}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
      />
    </FormControl>
  );
};

export default SelectFieldBlock;
