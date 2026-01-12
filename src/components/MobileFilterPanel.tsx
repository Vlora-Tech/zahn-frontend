import React, { useState } from "react";
import {
  Box,
  IconButton,
  Collapse,
  Badge,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { FilterAlt, ExpandMore, ExpandLess, Close } from "@mui/icons-material";

interface MobileFilterPanelProps {
  children: React.ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;
}

/**
 * A collapsible filter panel for mobile devices.
 * Shows a filter button with badge indicating active filters.
 * Expands to show filter controls when tapped.
 */
const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
  children,
  activeFilterCount = 0,
  onClearFilters,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleClear = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Filter toggle button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.65rem",
                  height: 16,
                  minWidth: 16,
                },
              }}
            >
              <FilterAlt fontSize="small" />
            </Badge>
          }
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          onClick={handleToggle}
          sx={{
            minHeight: 44,
            textTransform: "none",
            borderColor: activeFilterCount > 0 ? "primary.main" : "divider",
            color: activeFilterCount > 0 ? "primary.main" : "text.secondary",
          }}
        >
          Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            size="small"
            startIcon={<Close fontSize="small" />}
            onClick={handleClear}
            sx={{
              minHeight: 44,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Zurücksetzen
          </Button>
        )}
      </Box>

      {/* Collapsible filter content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mb: 1.5,
              fontWeight: 500,
            }}
          >
            Filter
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {children}
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default MobileFilterPanel;
