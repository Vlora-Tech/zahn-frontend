import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  useTheme,
  useMediaQuery,
  Typography,
  Box,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  useCreateLaborzettelTemplate,
  useUpdateLaborzettelTemplate,
} from "../../../api/laborzettel-templates/hooks";
import { useGetOperations } from "../../../api/operations/hooks";
import { useGetMaterials } from "../../../api/materials/hooks";
import {
  LaborzettelTemplate,
  PatientType,
  ImpressionType,
  ProcedureSectionDto,
} from "../../../api/laborzettel-templates/types";
import { Operation } from "../../../api/operations/types";
import { Material } from "../../../api/materials/types";
import ButtonBlock from "../../../components/atoms/ButtonBlock";
import SectionEditor from "./SectionEditor";

interface TemplateFormDialogProps {
  open: boolean;
  onClose: () => void;
  template: LaborzettelTemplate | null;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  operation: string;
  patientType: PatientType;
  impressionType: ImpressionType;
  material: string;
  sections: ProcedureSectionDto[];
  isActive: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name ist erforderlich"),
  operation: Yup.string().required("Vorgang ist erforderlich"),
  patientType: Yup.string()
    .oneOf(["gkv", "private"], "Ungültiger Patiententyp")
    .required("Patiententyp ist erforderlich"),
  impressionType: Yup.string()
    .oneOf(["scan", "abdruck"], "Ungültiger Abdrucktyp")
    .required("Abdrucktyp ist erforderlich"),
  material: Yup.string().required("Material ist erforderlich"),
  sections: Yup.array()
    .of(
      Yup.object({
        sectionHeader: Yup.string().required("Abschnittsname ist erforderlich"),
        procedures: Yup.array()
          .of(
            Yup.object({
              procedure: Yup.string().required("Leistung ist erforderlich"),
              defaultValue: Yup.string().required(
                "Standardwert ist erforderlich",
              ),
            }),
          )
          .min(1, "Mindestens eine Leistung ist erforderlich"),
        displayOrder: Yup.number(),
      }),
    )
    .min(1, "Mindestens ein Abschnitt ist erforderlich"),
  isActive: Yup.boolean(),
});

const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({
  open,
  onClose,
  template,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateLaborzettelTemplate();
  const updateMutation = useUpdateLaborzettelTemplate();

  // Fetch operations and materials for dropdowns
  const { data: operationsResponse } = useGetOperations({
    page: 1,
    limit: 100,
  });
  const { data: materialsResponse } = useGetMaterials({ page: 1, limit: 100 });

  // Sort operations and materials alphabetically
  const operations = [
    ...((operationsResponse as { data: Operation[] } | undefined)?.data || []),
  ].sort((a, b) => a.name.localeCompare(b.name, "de"));

  const materials = [
    ...((materialsResponse as { data: Material[] } | undefined)?.data || []),
  ].sort((a, b) => a.name.localeCompare(b.name, "de"));

  // Get operation ID from template (handles both string and object)
  const getOperationId = (op: string | Operation | undefined): string => {
    if (!op) return "";
    if (typeof op === "string") return op;
    return op._id || "";
  };

  // Get material ID from template (handles both string and object)
  const getMaterialId = (mat: string | Material | undefined): string => {
    if (!mat) return "";
    if (typeof mat === "string") return mat;
    return mat._id || "";
  };

  // Convert template sections to DTO format
  const convertSectionsToDto = (
    sections: LaborzettelTemplate["sections"] | undefined,
  ): ProcedureSectionDto[] => {
    if (!sections || sections.length === 0) {
      return [
        {
          sectionHeader: "",
          procedures: [],
          displayOrder: 0,
        },
      ];
    }
    return sections.map((section, index) => ({
      sectionHeader: section.sectionHeader,
      procedures: section.procedures.map((proc) => ({
        procedure:
          typeof proc.procedure === "string"
            ? proc.procedure
            : proc.procedure._id,
        defaultValue: proc.defaultValue,
      })),
      displayOrder: section.displayOrder ?? index,
    }));
  };

  const initialValues: FormValues = {
    name: template?.name,
    operation: getOperationId(template?.operation),
    patientType: template?.patientType,
    impressionType: template?.impressionType,
    material: getMaterialId(template?.material),
    sections: convertSectionsToDto(template?.sections),
    isActive: template?.isActive ?? true,
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setError(null);

      // Ensure sections have proper displayOrder
      const sectionsWithOrder = values.sections.map((section, index) => ({
        ...section,
        displayOrder: section.displayOrder ?? index,
      }));

      const templateData = {
        name: values.name,
        operation: values.operation,
        patientType: values.patientType,
        impressionType: values.impressionType,
        material: values.material,
        sections: sectionsWithOrder,
        isActive: values.isActive,
      };

      if (template) {
        await updateMutation.mutateAsync({
          id: template._id,
          data: templateData,
        });
      } else {
        await createMutation.mutateAsync(templateData);
      }

      onSuccess();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(`Fehler beim Speichern der Vorlage: ${errorMessage}`);
    }
  };

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {template ? "Vorlage bearbeiten" : "Neue Vorlage"}
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form>
            <DialogContent sx={{ overflow: "auto" }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
              <Stack spacing={3}>
                {/* Template Name */}
                <TextField
                  fullWidth
                  name="name"
                  label="Vorlagenname"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />

                {/* Operation Dropdown */}
                <Autocomplete
                  options={operations}
                  getOptionLabel={(option: Operation) => option.name}
                  value={
                    operations.find((op) => op._id === values.operation) || null
                  }
                  onChange={(_, newValue) =>
                    setFieldValue("operation", newValue?._id || "")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Vorgang"
                      error={touched.operation && Boolean(errors.operation)}
                      helperText={touched.operation && errors.operation}
                    />
                  )}
                />

                {/* Patient Type and Impression Type Row */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <FormControl
                    fullWidth
                    error={touched.patientType && Boolean(errors.patientType)}
                  >
                    <InputLabel>Patiententyp</InputLabel>
                    <Select
                      name="patientType"
                      value={values.patientType}
                      label="Patiententyp"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="gkv">GKV</MenuItem>
                      <MenuItem value="private">Privat</MenuItem>
                    </Select>
                    {touched.patientType && errors.patientType && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.patientType}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    error={
                      touched.impressionType && Boolean(errors.impressionType)
                    }
                  >
                    <InputLabel>Abdrucktyp</InputLabel>
                    <Select
                      name="impressionType"
                      value={values.impressionType}
                      label="Abdrucktyp"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="digital">Digital</MenuItem>
                      <MenuItem value="conventional">Konventionell</MenuItem>
                    </Select>
                    {touched.impressionType && errors.impressionType && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.impressionType}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* Material Dropdown */}
                <Autocomplete
                  options={materials}
                  getOptionLabel={(option: Material) => option.name}
                  value={
                    materials.find((mat) => mat._id === values.material) || null
                  }
                  onChange={(_, newValue) =>
                    setFieldValue("material", newValue?._id || "")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Material"
                      error={touched.material && Boolean(errors.material)}
                      helperText={touched.material && errors.material}
                    />
                  )}
                />

                {/* Active Status */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isActive}
                      onChange={(e) =>
                        setFieldValue("isActive", e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Vorlage aktiv"
                />

                {/* Section Editor */}
                <Box
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "10px",
                    p: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Leistungsabschnitte
                  </Typography>
                  <SectionEditor
                    sections={values.sections}
                    onChange={(newSections) =>
                      setFieldValue("sections", newSections)
                    }
                    error={
                      touched.sections && typeof errors.sections === "string"
                        ? errors.sections
                        : undefined
                    }
                  />
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <ButtonBlock
                onClick={onClose}
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
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                style={{
                  background:
                    "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "40px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
                  ? "Speichern..."
                  : "Speichern"}
              </ButtonBlock>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TemplateFormDialog;
