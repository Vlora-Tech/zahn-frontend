import { Form, Formik } from "formik";
import { Box, Grid, IconButton, Paper, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import {
  useUpdateLabTechnician,
  useGetLabTechnicianById,
} from "../../api/lab-technicians/hooks";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useSnackbar } from "../../context/SnackbarContext";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

// Validation schema
const validationSchema = yup.object({
  firstName: yup.string().required("Vorname ist erforderlich"),
  lastName: yup.string().required("Nachname ist erforderlich"),
  gender: yup.string().required("Geschlecht ist erforderlich"),
  clinic: yup.string().required("Labor ist erforderlich"),
  username: yup.string().required("Username ist erforderlich"),
  password: yup.string(),
  email: yup
    .string()
    .email("Ungültige E-Mail-Adresse")
    .required("E-Mail ist erforderlich"),
  phoneNumber: yup.string().required("Telefonnummer ist erforderlich"),
  notes: yup.string(),
});

// Initial values
const initialValues = {
  firstName: "",
  lastName: "",
  gender: "",
  clinic: "",
  username: "",
  password: "",
  email: "",
  phoneNumber: "",
  notes: "",
};

export default function EditLabTechnician() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: updateLabTechnician, isPending } = useUpdateLabTechnician();
  const { openSnackbar } = useSnackbar();
  const { data: clinics } = useGetClinics();
  const { data: labTechnicianData, isLoading } = useGetLabTechnicianById(
    id || "",
  );

  // Prepare form initial values from data
  const formInitialValues = useMemo(() => {
    if (!labTechnicianData) return initialValues;
    return {
      firstName: labTechnicianData.firstName || "",
      lastName: labTechnicianData.lastName || "",
      gender: labTechnicianData.gender || "",
      clinic:
        typeof labTechnicianData.clinic === "object"
          ? labTechnicianData.clinic._id
          : labTechnicianData.clinic || "",
      username: labTechnicianData.username || "",
      password: "",
      email: labTechnicianData.email || "",
      phoneNumber: labTechnicianData.phoneNumber || "",
      notes: labTechnicianData.notes || "",
    };
  }, [labTechnicianData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!labTechnicianData && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Labortechniker nicht gefunden</Typography>
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

        // Remove password from update if it's empty
        const updateData: any = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }

        updateLabTechnician(
          { id, data: updateData },
          {
            onSuccess: (response) => {
              console.log("Lab technician updated successfully:", response);
              openSnackbar({
                type: "success",
                message: "Labortechniker erfolgreich aktualisiert",
              });
              navigate("/lab-technicians");
            },
            onError: (error) => {
              openSnackbar({
                type: "error",
                message:
                  (error.response?.data as { message?: string })?.message ||
                  "Labortechniker konnte nicht aktualisiert werden",
              });
              console.error("Error updating lab technician:", error);
            },
          },
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/lab-technicians")}
              sx={{ color: "rgba(146, 146, 146, 1)" }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h2"
              sx={{
                fontWeight: "600",
                fontSize: "24px",
                color: "rgba(146, 146, 146, 1)",
              }}
            >
              Labortechniker Bearbeiten
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
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectFieldBlock
                  name="clinic"
                  label="Labor *"
                  options={
                    clinics?.data?.map((clinic) => ({
                      label: clinic.name,
                      value: clinic._id,
                    })) || []
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="username" label="Username *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock
                  name="password"
                  label="Passwort"
                  type="password"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="email" label="E-Mail *" type="email" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="phoneNumber" label="Telefonnummer *" />
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
                justifyContent: { xs: "stretch", sm: "flex-end" },
                marginTop: "20px",
              }}
            >
              <ButtonBlock
                type="submit"
                style={{
                  background:
                    "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "44px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
                sx={{
                  width: { xs: "100%", sm: "143px" },
                  minHeight: "44px",
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
