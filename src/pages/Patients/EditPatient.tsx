import { Form, Formik } from "formik";
import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useUpdatePatient, useGetPatientById } from "../../api/patients/hooks";
import PatientTypeToggle from "../PatientDashboard/components/ui/PatientTypeToggle";
import { useSnackbar } from "../../context/SnackbarContext";
import { PatientRequestBody } from "../../api/patients/types";
import { AxiosError, isAxiosError } from "axios";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

// Validation schema to match the form fields and API requirements
const validationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  gender: yup.string().required(),
  birthDate: yup.string().required(),
  patientType: yup.string().required(),
  notizen: yup.string(), // Assuming 'Notzin' is optional notes
});

// Initial values for the form fields
const initialValues: Partial<PatientRequestBody> = {
  firstName: "",
  lastName: "",
  gender: "male",
  birthDate: "",
  patientType: "private",
  notes: "",
};

export default function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { mutate: updatePatient, isPending } = useUpdatePatient();
  const { data: patientData, isLoading: isPatientLoading } = useGetPatientById(
    id || ""
  );

  // Prepare form initial values from patient data
  const formInitialValues = useMemo(() => {
    if (!patientData) return initialValues;
    return {
      firstName: patientData?.firstName,
      lastName: patientData?.lastName,
      gender: patientData?.gender,
      birthDate: patientData?.birthDate
        ? patientData?.birthDate.split("T")[0]
        : "",
      patientType: patientData?.patientType,
      notes: patientData?.notes,
    } as Partial<PatientRequestBody>;
  }, [patientData]);

  if (isPatientLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (!patientData && !isPatientLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Patient nicht gefunden</Typography>
      </Box>
    );
  }

  return (
    <Formik
      enableReinitialize
      initialValues={formInitialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (!id) return;

        updatePatient(
          { patientId: id, data: values },
          {
            onSuccess: () => {
              openSnackbar({
                type: "success",
                message: "Patient erfolgreich aktualisiert",
              });
              navigate("/patients");
            },
            onError: (error) => {
              console.error("Error updating patient:", error);

              let message = "Patient konnte nicht aktualisiert werden";

              if (isAxiosError<AxiosError>(error)) {
                message = error.response?.data?.message ?? message;
              }

              openSnackbar({ type: "error", message });
            },
          }
        );
      }}
    >
      <Form>
        <Box
          display="flex"
          flexDirection="column"
          gap="20px"
          width="100%"
          maxWidth="824px"
          mx="auto"
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "600",
              fontSize: "24px",
              color: "rgba(146, 146, 146, 1)",
            }}
          >
            Patient Bearbeiten
          </Typography>

          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              padding: "26px 40px",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextFieldBlock name="firstName" label="Vorname *" />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="lastName" label="Nachname *" />
              </Grid>

              <Grid size={6}>
                <SelectFieldBlock
                  name="gender"
                  label="Geschlecht *"
                  options={[
                    {
                      label: "Männlich",
                      value: "male",
                    },
                    {
                      label: "Weiblich",
                      value: "female",
                    },
                  ]}
                  enableClear={false}
                />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock
                  name="birthDate"
                  label="Geburtstag *"
                  type="date"
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={6}>
                <PatientTypeToggle name="patientType" label="Patient Typ" />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <TextFieldBlock
                  name="notes"
                  label="Notizen"
                  multiline={true}
                  minRows={7}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
              gap="10px"
            >
              <ButtonBlock
                onClick={() => {
                  navigate("/patients");
                }}
                style={{
                  borderRadius: "40px",
                  height: "40px",
                  color: "rgba(107, 107, 107, 1)",
                  width: "143px",
                  fontSize: "16px",
                  fontWeight: "500",
                  boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                }}
              >
                Abbrechen
              </ButtonBlock>

              <ButtonBlock
                type="submit"
                style={{
                  background:
                    "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "40px",
                  color: "white",
                  width: "143px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
                disabled={isPending}
              >
                Aktualisieren
              </ButtonBlock>
            </Box>
          </Paper>
        </Box>
      </Form>
    </Formik>
  );
}
