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
// You will need to replace this with your actual component import.
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useCreateUser } from "../../api/users/hooks";
import { useSnackbar } from "../../context/SnackbarContext";
import { useMemo } from "react";
import { UserRequestBody } from "../../api/users/types";
import { useNavigate } from "react-router-dom";

// Validation schema to match the form fields and API requirements
export const validationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  gender: yup.string().required(),
  role: yup.string().required(),
  clinic: yup.string().required(),
  username: yup.string().required(),
  password: yup.string().required(),
  email: yup.string().email("Ungültige E-Mail-Adresse").required(),
  phoneNumber: yup.string().required(),
  notizen: yup.string(), // Assuming 'Notzin' is optional notes
});

// Initial values for the form fields
export const initialValues: UserRequestBody = {
  firstName: "",
  lastName: "",
  gender: null,
  role: "staff",
  clinic: "",
  username: "",
  password: "",
  email: "",
  phoneNumber: "",
  notes: "",
};

export default function CreateUser() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mutate: createUser, isPending } = useCreateUser();
  const { data: clinics } = useGetClinics();

  const clinicsOptions = useMemo(() => {
    if (!clinics || !clinics.data?.length) return [];
    return clinics?.data.map((clinic) => ({
      label: clinic.name,
      value: clinic._id,
    }));
  }, [clinics]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        createUser(values, {
          onSuccess: (data) => {
            console.log("Clinic created successfully:", data);
            openSnackbar({
              type: "success",
              message: "Pflegefachkraft erfolgreich erstellt",
            });

            resetForm();

            navigate(`/nurses/${data._id}`);
          },
          onError: (error) => {
            console.error("Error creating clinic:", error);
            openSnackbar({
              type: "error",
              message:
                (error.response?.data as { message?: string })?.message ||
                "Pflegefachkraft konnte nicht erstellt werden",
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
              onClick={() => navigate("/nurses")}
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
              Neu Pflegefachkraft
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
                <SelectFieldBlock
                  name="clinic"
                  label="Klinik *"
                  options={clinicsOptions}
                  enableClear={false}
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="username" label="Username *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="password" label="Passwort *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="email" label="E-Mail *" type="email" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="phoneNumber" label="Telefonnummer *" />
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
