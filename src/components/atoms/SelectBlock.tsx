import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/material";
import { guid } from "../../utils/guid";

export const StyledSelect = styled(Select)(({ theme }) => ({
  ".MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
  },
  ".MuiSelect-select": {
    padding: "8px 16px",
    fontSize: "16px",
    fontWeight: "400",
    color: "rgba(102, 112, 133, 1)",
  },
  // Mobile: ensure minimum 44px height for touch targets
  [theme.breakpoints.down("sm")]: {
    minHeight: "44px",
    ".MuiSelect-select": {
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
    },
  },
}));

interface ISelectBlockProps {
  label?: string;
  options: { label: string; value: any }[];
  onChange: (event: SelectChangeEvent<unknown>) => void;
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
    <StyledSelect
      value={value}
      onChange={onChange}
      disableUnderline
      size="small"
      {...props}
      variant="outlined"
      sx={{
        borderRadius: "8px",
        width: "100%",
      }}
    >
      {enableClear && (
        <MenuItem value="" sx={{ minHeight: { xs: "44px", sm: "auto" } }}>
          <em>None</em>
        </MenuItem>
      )}
      {children
        ? children
        : options.map(({ label, value }) => (
            <MenuItem
              key={guid()}
              value={value}
              sx={{ minHeight: { xs: "44px", sm: "auto" } }}
            >
              {label}
            </MenuItem>
          ))}
    </StyledSelect>
  );
};

export default SelectBlock;
