import { Form, Formik } from "formik";
import { Box, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate } from "react-router-dom";
import { useCreateLabTechnician } from "../../api/lab-technicians/hooks";
import { CreateLabTechnicianDto } from "../../api/lab-technicians/types";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useSnackbar } from "../../context/SnackbarContext";

// Validation schema
const validationSchema = yup.object({
  firstName: yup.string().required("Vorname ist erforderlich"),
  lastName: yup.string().required("Nachname ist erforderlich"),
  gender: yup.string().required("Geschlecht ist erforderlich"),
  clinic: yup.string().required("Labor ist erforderlich"),
  username: yup.string().required("Username ist erforderlich"),
  password: yup.string().required("Passwort ist erforderlich"),
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

export default function CreateLabTechnician() {
  const { mutate: createLabTechnician, isPending } = useCreateLabTechnician();
  const { openSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const { data: clinics } = useGetClinics();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        const data: CreateLabTechnicianDto = {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender as "male" | "female" | "other",
          username: values.username,
          password: values.password,
          email: values.email,
          phoneNumber: values.phoneNumber,
          clinic: values.clinic,
          notes: values.notes || undefined,
        };
        createLabTechnician(data, {
          onSuccess: (response) => {
            console.log("Lab technician created successfully:", response);
            openSnackbar({
              type: "success",
              message: "Labortechniker erfolgreich erstellt",
            });

            resetForm();
            navigate("/lab-technicians");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { message?: string })?.message ||
              "Labortechniker konnte nicht erstellt werden";

            openSnackbar({
              type: "error",
              message: errorMessage,
            });
            console.error("Error creating lab technician:", error);
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
            Neuer Labortechniker
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
                  label="Labor *"
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
                <TextFieldBlock
                  name="password"
                  label="Passwort *"
                  type="password"
                />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="email" label="E-Mail *" type="email" />
              </Grid>

              <Grid size={6}>
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
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
              gap="10px"
            >
              <ButtonBlock
                type="reset"
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
