import { FormControl, FormLabel } from "@mui/material";
import { useField } from "formik";
import CheckboxBlock from "../../atoms/CheckboxBlock";

interface CheckboxFieldBlockProps {
  label?: string;
  name: string;
  disabled?: boolean;
}

const CheckboxFieldBlock: React.FC<CheckboxFieldBlockProps> = ({ label, name, disabled }) => {
  const [field] = useField(name);

  return (
    <FormControl fullWidth sx={{
      display: 'flex',
      flexDirection: 'row',
      gap: '10px',
      alignItems: 'center',
      justifyContent: 'flex-start',
    }}>

<CheckboxBlock
        {...field}
        disabled={disabled}
      />
      {label && <FormLabel
      sx={{
fontWeight: '400',
fontSize: '14px',
color: 'rgba(10, 77, 130, 1)',
lineHeight: 'normal',

      }}
      
      >{label}</FormLabel>}
    
    </FormControl>
  );
};

export default CheckboxFieldBlock;
