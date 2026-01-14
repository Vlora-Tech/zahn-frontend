import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  InputAdornment,
  Pagination,
  Alert,
  useTheme,
  useMediaQuery,
  Fab,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Print,
  Refresh,
  Settings,
  ArrowBack,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useGetLaborzettelTemplates,
  useDeleteLaborzettelTemplate,
} from "../../api/laborzettel-templates/hooks";
import { useQueryClient } from "@tanstack/react-query";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import {
  LaborzettelTemplate,
  GetLaborzettelTemplatesResponse,
} from "../../api/laborzettel-templates/types";
import { Operation } from "../../api/operations/types";
import { Material } from "../../api/materials/types";

// Helper to get operation name from template
const getOperationName = (template: LaborzettelTemplate): string => {
  if (typeof template.operation === "string") {
    return template.operation;
  }
  return (template.operation as Operation)?.name || "-";
};

// Helper to get material name from template
const getMaterialName = (template: LaborzettelTemplate): string => {
  if (typeof template.material === "string") {
    return template.material;
  }
  return (template.material as Material)?.name || "-";
};

// Patient type labels
const patientTypeLabels: Record<string, string> = {
  gkv: "GKV",
  private: "Privat",
};

// Impression type labels
const impressionTypeLabels: Record<string, string> = {
  scan: "Scan",
  abdruck: "Abdruck",
};

// Mobile card renderer for templates
const TemplateMobileCard = ({
  template,
  onEdit,
  onDelete,
}: {
  template: LaborzettelTemplate;
  onEdit: (template: LaborzettelTemplate) => void;
  onDelete: (template: LaborzettelTemplate) => void;
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Description sx={{ color: "#00796b", fontSize: 20 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
          >
            {template.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(template);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template);
            }}
            sx={{ color: "#d32f2f" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: "rgba(100, 100, 100, 1)", mb: 0.5 }}
      >
        Vorgang: {getOperationName(template)}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(100, 100, 100, 1)", mb: 0.5 }}
      >
        Material: {getMaterialName(template)}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
        <Chip
          label={
            patientTypeLabels[template.patientType] || template.patientType
          }
          size="small"
          sx={{
            backgroundColor:
              template.patientType === "gkv" ? "#e3f2fd" : "#fff3e0",
            color: template.patientType === "gkv" ? "#1976d2" : "#f57c00",
            fontSize: "11px",
          }}
        />
        <Chip
          label={
            impressionTypeLabels[template.impressionType] ||
            template.impressionType
          }
          size="small"
          sx={{
            backgroundColor:
              template.impressionType === "scan" ? "#e8f5e9" : "#fce4ec",
            color: template.impressionType === "scan" ? "#2e7d32" : "#c2185b",
            fontSize: "11px",
          }}
        />
        <Chip
          label={`${template.sections?.length || 0} Abschnitte`}
          size="small"
          variant="outlined"
          sx={{ fontSize: "11px" }}
        />
        {!template.isActive && (
          <Chip
            label="Inaktiv"
            size="small"
            sx={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              fontSize: "11px",
            }}
          />
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "rgba(146, 146, 146, 1)", display: "block", mt: 1 }}
      >
        Erstellt: <DateText date={template.createdAt} />
      </Typography>
    </Box>
  );
};

const LaborzettelTemplateManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<LaborzettelTemplate | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("createdAt");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const {
    data: templatesResponse,
    isLoading,
    refetch,
  } = useGetLaborzettelTemplates({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
    search: searchTerm || undefined,
  });
  const deleteMutation = useDeleteLaborzettelTemplate();

  const typedResponse = templatesResponse as
    | GetLaborzettelTemplatesResponse
    | undefined;
  const templateList = useMemo(
    () => typedResponse?.data || [],
    [typedResponse?.data],
  );
  const pagination = typedResponse?.pagination;

  const handleCreateNew = () => {
    navigate("/admin/laborzettel-templates/new");
  };

  const handleEdit = (template: LaborzettelTemplate) => {
    navigate(`/admin/laborzettel-templates/edit/${template._id}`);
  };

  const handleDeleteClick = (template: LaborzettelTemplate) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      try {
        await deleteMutation.mutateAsync(templateToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["laborzettel-templates"] });
        setDeleteConfirmOpen(false);
        setTemplateToDelete(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unbekannter Fehler";
        setError(`Fehler beim Löschen der Vorlage: ${errorMessage}`);
      }
    }
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on search
  };

  const mobileCardRenderer = (template: LaborzettelTemplate) => (
    <TemplateMobileCard
      template={template}
      onEdit={handleEdit}
      onDelete={handleDeleteClick}
    />
  );

  const columns: ColumnDef<LaborzettelTemplate>[] = [
    {
      id: "name",
      label: "Vorlagenname",
      accessor: (template) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Description sx={{ color: "#00796b", fontSize: 18 }} />
          <Typography variant="body2" fontWeight={500}>
            {template.name}
          </Typography>
        </Box>
      ),
      sortable: true,
      width: 200,
    },
    {
      id: "operation",
      label: "Vorgang",
      accessor: (template) => (
        <Typography variant="body2">{getOperationName(template)}</Typography>
      ),
      width: 150,
    },
    {
      id: "patientType",
      label: "Patiententyp",
      accessor: (template) => (
        <Chip
          label={
            patientTypeLabels[template.patientType] || template.patientType
          }
          size="small"
          sx={{
            backgroundColor:
              template.patientType === "gkv" ? "#e3f2fd" : "#fff3e0",
            color: template.patientType === "gkv" ? "#1976d2" : "#f57c00",
            fontSize: "12px",
          }}
        />
      ),
      width: 120,
    },
    {
      id: "impressionType",
      label: "Abdrucktyp",
      accessor: (template) => (
        <Chip
          label={
            impressionTypeLabels[template.impressionType] ||
            template.impressionType
          }
          size="small"
          sx={{
            backgroundColor:
              template.impressionType === "scan" ? "#e8f5e9" : "#fce4ec",
            color: template.impressionType === "scan" ? "#2e7d32" : "#c2185b",
            fontSize: "12px",
          }}
        />
      ),
      width: 130,
    },
    {
      id: "material",
      label: "Material",
      accessor: (template) => (
        <Typography variant="body2" color="text.secondary">
          {getMaterialName(template)}
        </Typography>
      ),
      width: 150,
    },
  ];

  const hasData = templateList.length > 0;

  return (
    <Stack
      flex="1"
      gap="20px"
      height="100%"
      sx={{ overflow: "hidden", minWidth: 0 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          onClick={() => navigate("/admin")}
          sx={{ color: "rgba(146, 146, 146, 1)" }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h2" sx={{ color: "rgba(146, 146, 146, 1)" }}>
          Laborzettel-Vorlagen
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: { xs: 0, sm: "10px" },
          background: "rgba(255, 255, 255, 1)",
          display: "flex",
          flexDirection: "column",
          flex: "1",
          overflow: "hidden",
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 2 },
            p: { xs: "12px 16px", sm: "16px 28px" },
          }}
        >
          <TextField
            size="small"
            placeholder="Vorlage suchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              minWidth: { xs: "100%", sm: 200, md: 300 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 1,
              "& .MuiInputBase-root": { minHeight: { xs: "44px", sm: "40px" } },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              justifyContent: "flex-end",
              alignItems: "center",
              flexShrink: 0,
              flex: { xs: "none", sm: 1 },
            }}
          >
            <ButtonBlock
              startIcon={<Add />}
              sx={{
                borderRadius: "40px",
                textTransform: "none",
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                color: "white",
                px: { xs: "16px", sm: "12px" },
                fontWeight: "500",
                fontSize: { xs: "14px", sm: "16px" },
                height: { xs: "44px", sm: "37px" },
                minHeight: "44px",
                marginRight: { xs: 0, md: "26px" },
              }}
              onClick={handleCreateNew}
            >
              Vorlage hinzufügen
            </ButtonBlock>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton>
                <Print />
              </IconButton>
              <IconButton onClick={() => refetch()} title="Aktualisieren">
                <Refresh />
              </IconButton>
              <IconButton>
                <Settings />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Box
            sx={{ flex: 1, overflowX: "auto", overflowY: "auto", minWidth: 0 }}
          >
            <ResponsiveTable<LaborzettelTemplate>
              data={templateList}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              isLoading={isLoading}
              emptyMessage={
                searchTerm
                  ? "Keine Vorlagen gefunden"
                  : "Keine Vorlagen vorhanden. Fügen Sie eine neue Vorlage hinzu."
              }
              getItemId={(template) => template._id}
              sortBy={orderBy}
              sortOrder={order}
              onSort={handleSort}
            />
          </Box>
          {hasData && pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: { xs: "16px", sm: "24px" },
                pb: { xs: "80px", sm: "24px" },
                flexShrink: 0,
              }}
            >
              <Pagination
                count={pagination.totalPages || 1}
                page={pagination.currentPage || 1}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie die Vorlage "{templateToDelete?.name}"
            löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <ButtonBlock
            onClick={() => setDeleteConfirmOpen(false)}
            style={{
              borderRadius: "40px",
              height: "40px",
              color: "rgba(107, 107, 107, 1)",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Abbrechen
          </ButtonBlock>
          <ButtonBlock
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
            style={{
              background: "rgba(247, 107, 107, 1)",
              borderRadius: "40px",
              height: "40px",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {deleteMutation.isPending ? "Löschen..." : "Löschen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>

      {/* Mobile: Floating Action Button */}
      {isMobile && (
        <Fab
          variant="extended"
          color="primary"
          aria-label="Vorlage hinzufügen"
          onClick={handleCreateNew}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #7AB02E 0%, #5BB8E0 100%)",
            },
            zIndex: 1000,
            gap: 1,
            color: "white",
          }}
        >
          <Add />
          Vorlage hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default LaborzettelTemplateManagement;
