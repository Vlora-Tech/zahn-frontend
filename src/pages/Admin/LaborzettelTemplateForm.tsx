import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  useCreateLaborzettelTemplate,
  useUpdateLaborzettelTemplate,
  useGetLaborzettelTemplateById,
} from "../../api/laborzettel-templates/hooks";
import { useGetOperations } from "../../api/operations/hooks";
import { useGetMaterials } from "../../api/materials/hooks";
import {
  LaborzettelTemplate,
  PatientType,
  ImpressionType,
  ProcedureSectionDto,
} from "../../api/laborzettel-templates/types";
import { Operation } from "../../api/operations/types";
import { Material } from "../../api/materials/types";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import SectionEditor from "./components/SectionEditor";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

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
    .oneOf(["scan", "abdruck"], "Ungültiger Abformungsart")
    .required("Abformungsart ist erforderlich"),
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

const LaborzettelTemplateForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateLaborzettelTemplate();
  const updateMutation = useUpdateLaborzettelTemplate();

  // Fetch template if editing
  const { data: existingTemplate, isLoading: isLoadingTemplate } =
    useGetLaborzettelTemplateById(id || "");

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

  const getInitialValues = (): FormValues => {
    if (existingTemplate) {
      return {
        name: existingTemplate.name || "",
        operation: getOperationId(existingTemplate.operation),
        patientType: existingTemplate.patientType,
        impressionType: existingTemplate.impressionType,
        material: getMaterialId(existingTemplate.material),
        sections: convertSectionsToDto(existingTemplate.sections),
        isActive: existingTemplate.isActive ?? true,
      };
    }

    return {
      name: "",
      operation: "",
      patientType: "",
      impressionType: "",
      material: "",
      sections: [
        {
          sectionHeader: "",
          procedures: [],
          displayOrder: 0,
        },
      ],
      isActive: true,
    };
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

      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          data: templateData,
        });
      } else {
        await createMutation.mutateAsync(templateData);
      }

      navigate("/admin/laborzettel-templates");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(`Fehler beim Speichern der Vorlage: ${errorMessage}`);
    }
  };

  const handleGoBack = () => {
    navigate("/admin/laborzettel-templates");
  };

  if (isEditMode && isLoadingTemplate) {
    return <LoadingSpinner />;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Stack flex="1" gap="16px" height="100%">
      {/* Loading overlay */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSaving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Back button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          backgroundColor: "white",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          "&:hover": { backgroundColor: "rgba(245,245,245,1)" },
          zIndex: 10,
          alignSelf: "flex-start",
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* Header */}
      <Paper
        sx={{
          borderRadius: "12px",
          background:
            "linear-gradient(90deg, rgba(0, 121, 107, 0.1) 0%, rgba(0, 150, 136, 0.1) 100%)",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#00796b",
            fontSize: { xs: "18px", sm: "24px" },
          }}
        >
          {isEditMode ? "Vorlage bearbeiten" : "Neue Vorlage"}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={getInitialValues()}
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
            <Stack spacing={2}>
              {/* Basic Info */}
              <Paper
                sx={{
                  borderRadius: "12px",
                  background: "white",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  p: { xs: 2, sm: 3 },
                }}
              >
                <Stack spacing={2}>
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

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    {/* Operation Dropdown */}
                    <FormControl
                      fullWidth
                      error={touched.operation && Boolean(errors.operation)}
                    >
                      <Autocomplete
                        options={operations}
                        getOptionLabel={(option: Operation) => option.name}
                        value={
                          operations.find(
                            (op) => op._id === values.operation,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setFieldValue("operation", newValue?._id || "")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Vorgang"
                            error={
                              touched.operation && Boolean(errors.operation)
                            }
                            helperText={touched.operation && errors.operation}
                          />
                        )}
                      />
                    </FormControl>
                    {/* Material Dropdown */}
                    <FormControl
                      fullWidth
                      error={touched.material && Boolean(errors.material)}
                    >
                      <Autocomplete
                        options={materials}
                        getOptionLabel={(option: Material) => option.name}
                        value={
                          materials.find(
                            (mat) => mat._id === values.material,
                          ) || null
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
                    </FormControl>
                  </Box>

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
                      <InputLabel>Abformungsart</InputLabel>
                      <Select
                        name="impressionType"
                        value={values.impressionType}
                        label="Abformungsart"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <MenuItem value="scan">Scan</MenuItem>
                        <MenuItem value="abdruck">Abdruck</MenuItem>
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
                </Stack>
              </Paper>

              {/* Section Editor */}
              <Paper
                sx={{
                  borderRadius: "12px",
                  background: "white",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  p: { xs: 2, sm: 3 },
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
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
              </Paper>

              {/* Save Button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  pb: 2,
                }}
              >
                <ButtonBlock
                  onClick={handleGoBack}
                  style={{
                    borderRadius: "40px",
                    height: "44px",
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "0 24px",
                  }}
                >
                  Abbrechen
                </ButtonBlock>
                <ButtonBlock
                  type="submit"
                  disabled={isSubmitting || isSaving}
                  startIcon={<Save />}
                  style={{
                    background:
                      "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                    borderRadius: "40px",
                    height: "44px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "0 24px",
                  }}
                >
                  {isSubmitting || isSaving ? "Speichern..." : "Speichern"}
                </ButtonBlock>
              </Box>
            </Stack>
          </Form>
        )}
      </Formik>
    </Stack>
  );
};

export default LaborzettelTemplateForm;
