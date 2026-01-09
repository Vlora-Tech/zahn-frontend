import { Form, Formik } from "formik";
import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import { useUpdateClinic, useGetClinicById } from "../../api/clinics/hooks";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useSnackbar } from "../../context/SnackbarContext";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

// Validation schema to match the form fields and API requirements
const validationSchema = yup.object({
  name: yup.string().required("Klinik Name is required"),
  street: yup.string().required("Straße is required"),
  buildingNo: yup.string().required("Gebaude Nummer is required"),
  postalCode: yup.string().required("Postal Code is required"),
  city: yup.string().required("Stadt is required"),
  phoneNumber: yup.string().required("Nummer is required"),
  notes: yup.string(), // Assuming 'Notzin' is optional notes
});

// Initial values for the form fields
const initialValues = {
  name: "",
  street: "",
  buildingNo: "",
  postalCode: "",
  city: "",
  phoneNumber: "",
  notes: "",
};

export default function EditClinic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { mutate: updateClinic, isPending } = useUpdateClinic();
  const { data: clinicData, isLoading: isClinicLoading } = useGetClinicById(
    id || ""
  );

  // Prepare form initial values from clinic data
  const formInitialValues = useMemo(() => {
    console.log("Clinic data in EditClinic:", clinicData);
    if (!clinicData) return initialValues;
    return {
      name: clinicData.name || "",
      street: clinicData.street || "",
      buildingNo: clinicData.buildingNo || "",
      postalCode: clinicData.postalCode || "",
      city: clinicData.city || "",
      phoneNumber: clinicData.phoneNumber || "",
      notes: clinicData.notes || "",
    };
  }, [clinicData]);

  if (isClinicLoading) {
    return <LoadingSpinner />;
  }

  if (!clinicData && !isClinicLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Klinik nicht gefunden</Typography>
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

        updateClinic(
          { clinicId: id, data: values },
          {
            onSuccess: (data) => {
              console.log("Clinic updated successfully:", data);
              openSnackbar({
                type: "success",
                message: "Klinik erfolgreich aktualisiert",
              });
              navigate("/clinics");
            },
            onError: (error) => {
              console.error("Error updating clinic:", error);
              const errorMessage =
                (error.response?.data as { message?: string })?.message ||
                "Klinik konnte nicht aktualisiert werden";

              openSnackbar({
                type: "error",
                message: errorMessage,
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
            Klinik Bearbeiten
          </Typography>

          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              padding: "26px 40px",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextFieldBlock name="name" label="Klinik Name*" />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="street" label="Straße*" />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="buildingNo" label="Gebaude Nummer*" />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="postalCode" label="Postal Code*" />
              </Grid>

              <Grid size={6}>
                <TextFieldBlock name="city" label="Stadt*" />
              </Grid>

              <Grid size={12}>
                <TextFieldBlock name="phoneNumber" label="Nummer*" />
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
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
              gap="10px"
            >
              <ButtonBlock
                onClick={() => {
                  navigate("/clinics");
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
