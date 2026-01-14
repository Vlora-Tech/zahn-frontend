import { Form, Formik } from "formik";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import * as yup from "yup";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import { useCreateClinic } from "../../api/clinics/hooks";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext";
import { CreateClinicDto } from "../../api/clinics/types";

const validationSchema = yup.object({
  name: yup
    .string()
    .required("Klinik Name is required")
    .min(2, "Klinik Name must be at least 2 characters")
    .max(100, "Klinik Name cannot exceed 100 characters"),

  street: yup
    .string()
    .required("Straße is required")
    .min(2, "Straße must be at least 2 characters")
    .max(100, "Straße cannot exceed 100 characters"),

  buildingNo: yup
    .string()
    .required("Gebäude Nummer is required")
    .matches(/^[0-9A-Za-z\-/]+$/, "Invalid Gebäude Nummer format")
    .max(10, "Gebäude Nummer cannot exceed 10 characters"),

  postalCode: yup
    .string()
    .required("Postal Code is required")
    .matches(/^\d{4,6}$/, "Postal Code must be 4–6 digits"),

  city: yup
    .string()
    .required("Stadt is required")
    .min(2, "Stadt must be at least 2 characters")
    .max(50, "Stadt cannot exceed 50 characters"),

  phoneNumber: yup
    .string()
    .required("Nummer is required")
    .matches(
      /^\+?[0-9]{7,15}$/,
      "Phone number must be valid and contain 7–15 digits",
    ),

  notes: yup.string().max(500, "Notes cannot exceed 500 characters").nullable(), // explicitly allows null as well as empty string
});

// Initial values for the form fields
const initialValues: CreateClinicDto = {
  name: "",
  street: "",
  buildingNo: "",
  postalCode: "",
  city: "",
  phoneNumber: "",
  notes: "",
};

export default function CreateClinic() {
  const { openSnackbar } = useSnackbar();
  const { mutate: createClinic, isPending } = useCreateClinic();

  const navigate = useNavigate();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        createClinic(values, {
          onSuccess: (data) => {
            console.log("Clinic created successfully:", data);
            // Here you could add further actions, like showing a success notification
            // or redirecting the user.
            openSnackbar({
              type: "success",
              message: "Klinik erfolgreich erstellt",
            });

            resetForm();

            navigate("/clinics");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { message?: string })?.message ||
              "Klinik konnte nicht erstellt werden";
            console.error("Error creating clinic:", error);

            openSnackbar({
              type: "error",
              message: errorMessage,
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
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/clinics")}
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
              Neu Klinik
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
              <Grid size={12}>
                <TextFieldBlock name="name" label="Klinikname *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="street" label="Straße *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="buildingNo" label="Gebäudenummer *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="postalCode" label="Postleitzahl *" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldBlock name="city" label="Stadt *" />
              </Grid>

              <Grid size={12}>
                <TextFieldBlock name="phoneNumber" label="Telefonnummer *" />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ marginY: 2 }} />
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
