import { Form, Formik } from "formik";
import { Box, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
// You will need to replace this with your actual component import.
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate } from "react-router-dom";
import { useCreateDoctor } from "../../api/doctors/hooks";
import { CreateDoctorDto } from "../../api/doctors/types";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useSnackbar } from "../../context/SnackbarContext";

// Validation schema to match the form fields and API requirements
const validationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  gender: yup.string().required(),
  clinic: yup.string().required(),
  username: yup.string().required(),
  password: yup.string().required(),
  notizen: yup.string(), // Assuming 'Notzin' is optional notes
});

// Initial values for the form fields
const initialValues = {
  firstName: "",
  lastName: "",
  gender: "",
  clinic: "",
  username: "",
  password: "",
  notes: "",
};

export default function CreateDoctor() {
  const { mutate: createDoctor, isPending } = useCreateDoctor();
  const { openSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const { data: clinics } = useGetClinics();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        const doctorData: CreateDoctorDto = {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender as "male" | "female" | "other",
          username: values.username,
          password: values.password,
          clinic: values.clinic,
          notes: values.notes || undefined,
        };
        createDoctor(doctorData, {
          onSuccess: (data) => {
            console.log("Clinic created successfully:", data);
            openSnackbar({
              type: "success",
              message: "Artzt erfolgreich erstellt",
            });

            resetForm();

            navigate("/doctors");
            // Here you could add further actions, like showing a success notification
            // or redirecting the user.
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { message?: string })?.message ||
              "Artzt konnte nicht erstellt werden";

            openSnackbar({
              type: "error",
              message: errorMessage,
            });
            console.error("Error creating clinic:", error);
            // Handle the error, e.g., by showing an error message to the user.
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
        >
          <Typography
            variant="h2"
            sx={{
              color: "rgba(146, 146, 146, 1)",
            }}
          >
            Neu Artzt
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
                <SelectFieldBlock
                  name="clinic"
                  label="Klinik *"
                  options={
                    clinics?.data.map((clinic) => ({
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
                <TextFieldBlock name="password" label="Passwort *" />
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
                type="reset"
                style={{
                  // background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "40px",
                  color: "rgba(107, 107, 107, 1)",
                  width: "143px",
                  fontSize: "16px",

                  fontWeight: "500",

                  boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                }}
              >
                Zurücksetzen
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
                Absenden
              </ButtonBlock>
            </Box>
          </Paper>
        </Box>
      </Form>
    </Formik>
  );
}
