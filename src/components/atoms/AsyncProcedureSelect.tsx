import React, { useState, useEffect, useCallback } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { Procedure } from "../../api/procedures/types";
import { getProcedures } from "../../api/procedures/requests";

interface AsyncProcedureSelectProps {
  value: Procedure | null;
  onChange: (procedure: Procedure | null) => void;
  placeholder?: string;
  size?: "small" | "medium";
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * AsyncProcedureSelect - An async autocomplete component for selecting procedures
 * Features:
 * - Debounced search (300ms)
 * - Searches by procedure number or name
 * - Shows loading state while fetching
 * - Caches initial results
 */
const AsyncProcedureSelect: React.FC<AsyncProcedureSelectProps> = ({
  value,
  onChange,
  placeholder = "Leistung auswählen",
  size = "small",
  disabled = false,
  error = false,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Debounce the search input
  const debouncedSearch = useDebounce(inputValue, 300);

  // Fetch procedures based on search term
  const fetchProcedures = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const response = await getProcedures({
        page: 1,
        limit: 50,
        search: search || undefined,
        sortBy: "number",
        sortOrder: "asc",
      });
      setOptions(response.data || []);
    } catch (err) {
      console.error("Error fetching procedures:", err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when debounced search changes or dropdown opens
  useEffect(() => {
    if (open) {
      fetchProcedures(debouncedSearch);
    }
  }, [debouncedSearch, open, fetchProcedures]);

  // Format option label
  const getOptionLabel = useCallback((option: Procedure) => {
    return `${option.number} - ${option.name}`;
  }, []);

  // Check if options are equal
  const isOptionEqualToValue = useCallback(
    (option: Procedure, val: Procedure) => {
      return option._id === val._id;
    },
    [],
  );

  return (
    <Autocomplete
      size={size}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      disabled={disabled}
      filterOptions={(x) => x} // Disable client-side filtering since we filter on server
      noOptionsText={
        loading
          ? "Laden..."
          : inputValue.length > 0
            ? "Keine Leistungen gefunden"
            : "Tippen Sie, um zu suchen..."
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <span style={{ fontFamily: "monospace", marginRight: 8 }}>
            {option.number}
          </span>
          {option.name}
        </li>
      )}
    />
  );
};

export default AsyncProcedureSelect;
