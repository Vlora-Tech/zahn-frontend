import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/material";
import { guid } from "../../utils/guid";

export const StyledSelect = styled(Select)({
  ".MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
  },
  ".MuiSelect-select": {
    padding: "8px 16px",
    fontSize: "16px",
    fontWeight: "400",
    color: "rgba(102, 112, 133, 1)",
  },
});

interface ISelectBlockProps {
  label?: string;
  options: { label: string; value: any }[];
  onChange: (event: SelectChangeEvent<string | number>) => void;
  [key: string]: any;
  value?: string;
  enableClear?: boolean;
}

const SelectBlock: React.FC<ISelectBlockProps> = ({
  children,
  options = [],
  onChange,
  value,
  enableClear = true,
  ...props
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      disableUnderline
      size="small"
      {...props}
      variant="outlined"
      sx={{
        borderRadius: "8px",
      }}
    >
      {enableClear && (
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
      )}
      {children
        ? children
        : options.map(({ label, value }) => (
            <MenuItem key={guid()} value={value}>
              {label}
            </MenuItem>
          ))}
    </Select>
  );
};

export default SelectBlock;
