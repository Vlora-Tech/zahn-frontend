import { Form, Formik } from "formik";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import * as yup from "yup";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate } from "react-router-dom";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useCreatePatient } from "../../api/patients/hooks";
import PatientTypeToggle from "../PatientDashboard/components/ui/PatientTypeToggle";
import { useSnackbar } from "../../context/SnackbarContext";
import { CreatePatientDto } from "../../api/patients/types";
import { AxiosError, isAxiosError } from "axios";

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
const initialValues: CreatePatientDto = {
  firstName: "",
  lastName: "",
  gender: "male",
  birthDate: "",
  patientType: "private",
  notes: "",
};

export default function CreatePatient() {
  const { openSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { mutate: createPatient, isPending } = useCreatePatient();

  const navigate = useNavigate();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        createPatient(values, {
          onSuccess: (data) => {
            console.log("Clinic created successfully:", data);
            openSnackbar({
              type: "success",
              message: "Patient erfolgreich erstellt",
            });

            resetForm();

            navigate(`/patients/${data._id}`);
          },
          onError: (error) => {
            console.error("Error creating clinic:", error);
            let message = "Patient konnte nicht erstellt werden";

            if (isAxiosError<AxiosError>(error)) {
              message = error.response?.data?.message ?? message;
            }

            openSnackbar({
              type: "error",
              message,
            });
          },
        });
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
          px={{ xs: 2, sm: 0 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/patients")}
              sx={{ color: "rgba(146, 146, 146, 1)" }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h2"
              sx={{
                fontWeight: "600",
                fontSize: { xs: "20px", sm: "24px" },
                color: "rgba(146, 146, 146, 1)",
              }}
            >
              Neuer Patient
            </Typography>
          </Box>

          <Paper
            sx={{
              borderRadius: { xs: 0, sm: "10px" },
              background: "rgba(255, 255, 255, 1)",
              padding: { xs: "16px", sm: "26px 40px" },
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="firstName" label="Vorname *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="lastName" label="Nachname *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock
                  name="birthDate"
                  label="Geburtstag *"
                  type="date"
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <PatientTypeToggle name="patientType" label="Patiententyp *" />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <TextFieldBlock
                  name="notes"
                  label="Notizen"
                  multiline={true}
                  minRows={isMobile ? 4 : 7}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <ButtonBlock
                type="submit"
                disabled={isPending}
                startIcon={<Save />}
                style={{
                  borderRadius: "40px",
                  height: "44px",
                  color: "white",
                  background:
                    "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0px 2px 4px rgba(76, 175, 80, 0.3)",
                  padding: "0 24px",
                }}
              >
                Speichern
              </ButtonBlock>
            </Box>
          </Paper>
        </Box>
      </Form>
    </Formik>
  );
}
