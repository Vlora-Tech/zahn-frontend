import { Form, Formik } from "formik";
import { Box, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useUpdateLabTechnician, useGetLabTechnicianById } from "../../api/lab-technicians/hooks";
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
  notes: "",
};

export default function EditLabTechnician() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: updateLabTechnician, isPending } = useUpdateLabTechnician();
  const { openSnackbar } = useSnackbar();
  const { data: clinics } = useGetClinics();
  const { data: labTechnicianData, isLoading } = useGetLabTechnicianById(id || "");

  // Prepare form initial values from data
  const formInitialValues = useMemo(() => {
    if (!labTechnicianData) return initialValues;
    return {
      firstName: labTechnicianData.firstName || "",
      lastName: labTechnicianData.lastName || "",
      gender: labTechnicianData.gender || "",
      clinic: typeof labTechnicianData.clinic === "object" 
        ? labTechnicianData.clinic._id 
        : labTechnicianData.clinic || "",
      username: labTechnicianData.username || "",
      password: "",
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
            Labortechniker Bearbeiten
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
                />
              </Grid>

              <Grid size={6}>
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

              <Grid size={6}>
                <TextFieldBlock name="username" label="Username *" />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock
                  name="password"
                  label="Passwort (leer lassen, um unverändert zu lassen)"
                  type="password"
                />
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
                onClick={() => navigate("/lab-technicians")}
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
