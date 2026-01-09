import { Form, Formik } from "formik";
import { Box, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useUpdateDoctor, useGetDoctorById } from "../../api/doctors/hooks";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useSnackbar } from "../../context/SnackbarContext";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

// Validation schema to match the form fields and API requirements
export const validationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  gender: yup.string().required(),
  clinic: yup.string().required(),
  username: yup.string().required(),
  password: yup.string(),
  notizen: yup.string(), // Assuming 'Notzin' is optional notes
});

// Initial values for the form fields
export const initialValues = {
  firstName: "",
  lastName: "",
  gender: "",
  clinic: "",
  username: "",
  password: "",
  notes: "",
};

export default function EditDoctor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: updateDoctor, isPending } = useUpdateDoctor();
  const { openSnackbar } = useSnackbar();
  const { data: clinics } = useGetClinics();
  const { data: doctorData, isLoading: isDoctorLoading } = useGetDoctorById(
    id || ""
  );

  // Prepare form initial values from doctor data
  const formInitialValues = useMemo(() => {
    if (!doctorData) return initialValues;
    return {
      firstName: doctorData.firstName || "",
      lastName: doctorData.lastName || "",
      gender: doctorData.gender || "",
      clinic: doctorData.clinic || "",
      username: doctorData.username || "",
      password: "", // Don't pre-fill password for security
      notes: doctorData.notes || "",
    };
  }, [doctorData]);

  if (isDoctorLoading) {
    return <LoadingSpinner />;
  }

  if (!doctorData && !isDoctorLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Arzt nicht gefunden</Typography>
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

        updateDoctor(
          { doctorId: id, data: updateData },
          {
            onSuccess: (data) => {
              console.log("Doctor updated successfully:", data);
              openSnackbar({
                type: "success",
                message: "Arzt erfolgreich aktualisiert",
              });
              navigate("/doctors");
            },
            onError: (error) => {
              openSnackbar({
                type: "error",
                message:
                  (error.response?.data as { message?: string })?.message ||
                  "Arzt konnte nicht aktualisiert werden",
              });
              console.error("Error updating doctor:", error);
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
            Arzt Bearbeiten
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
                  label="Klinik *"
                  options={
                    clinics?.data?.map((clinic) => ({
                      label: clinic.name,
                      value: clinic._id,
                    })) || []
                  }
                />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="username" label="Username*" />
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
                onClick={() => navigate("/doctors")}
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
