import { Form, Formik } from "formik";
import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useUpdateUser, useGetUserById } from "../../api/users/hooks";
import { useSnackbar } from "../../context/SnackbarContext";
import { useMemo } from "react";
import { UserRequestBody } from "../../api/users/types";
import { UpdateUserDto } from "../../api/users/types";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

// Validation schema to match the form fields and API requirements
const validationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  gender: yup.string().required(),
  role: yup.string().required(),
  clinic: yup.string().required(),
  username: yup.string().required(),
  password: yup.string(),
  notizen: yup.string(), // Assuming 'Notzin' is optional notes
});

// Initial values for the form fields
const initialValues: UserRequestBody = {
  firstName: "",
  lastName: "",
  gender: "male",
  role: "staff",
  clinic: "",
  username: "",
  password: "",
  notes: "",
};

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { data: clinics } = useGetClinics();
  const { data: userData, isLoading: isUserLoading } = useGetUserById(id || "");

  const clinicsOptions = useMemo(() => {
    if (!clinics || !clinics.data?.length) return [];
    return clinics?.data.map((clinic) => ({
      label: clinic.name,
      value: clinic._id,
    }));
  }, [clinics]);

  // Prepare form initial values from user data
  const formInitialValues = useMemo(() => {
    if (!userData) return initialValues;
    return {
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      gender: userData.gender || "male",
      role: userData.role || "staff",
      clinic: userData.clinic || "",
      username: userData.username || "",
      password: "", // Don't pre-fill password for security
      notes: userData.notes || "",
    };
  }, [userData]);

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  if (!userData && !isUserLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Benutzer nicht gefunden</Typography>
      </Box>
    );
  }

  return (
    <Formik
      enableReinitialize
      initialValues={formInitialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        if (!id) return;

        // Remove password from update if it's empty
        const updateData: any = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }

        updateUser(
          { userId: id, data: updateData as UpdateUserDto },
          {
            onSuccess: (data) => {
              console.log("User updated successfully:", data);
              openSnackbar({
                type: "success",
                message: "Benutzer erfolgreich aktualisiert",
              });
              resetForm();
              navigate("/nurses");
            },
            onError: (error) => {
              console.error("Error updating user:", error);
              openSnackbar({
                type: "error",
                message:
                  (error.response?.data as { message?: string })?.message ||
                  "Benutzer konnte nicht aktualisiert werden",
              });
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
            Pflegefachkraft Bearbeiten
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
                  name="clinic"
                  label="Klinik *"
                  options={clinicsOptions}
                />
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

              <Grid size={12}>
                <Divider />
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
                onClick={() => navigate("/users")}
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
