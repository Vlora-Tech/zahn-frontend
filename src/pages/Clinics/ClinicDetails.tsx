import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useGetClinicById } from "../../api/clinics/hooks";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function ClinicDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const clinicId = params?.id;
  const { data: clinic, isLoading } = useGetClinicById(clinicId || "");

  const handleEditClinic = () => {
    if (clinicId) {
      navigate(`/clinics/edit/${clinicId}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!clinic && !isLoading) {
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
            fontSize: { xs: "20px", sm: "24px" },
            color: "rgba(146, 146, 146, 1)",
          }}
        >
          Klinikinformationen
        </Typography>
      </Box>

      <Paper
        sx={{
          borderRadius: { xs: 0, sm: "10px" },
          background: "rgba(255, 255, 255, 1)",
          padding: { xs: "16px", sm: "26px 40px" },
        }}
      >
        <Stack gap={{ xs: "24px", sm: "42px" }}>
          {[
            { label: "Klinik Name", value: clinic?.name },
            { label: "Straße", value: clinic?.street },
            { label: "Gebäudenummer", value: clinic?.buildingNo },
            { label: "Postleitzahl", value: clinic?.postalCode },
            { label: "Stadt", value: clinic?.city },
            { label: "Telefonnummer", value: clinic?.phoneNumber },
            {
              label: "Notizen",
              value: clinic?.notes || "Keine Notizen verfügbar",
            },
          ].map(({ label, value }) => (
            <Stack gap="8px" key={label}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "400",
                  fontSize: { xs: "14px", sm: "16px" },
                  color: "rgba(10, 77, 130, 1)",
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "500",
                  fontSize: { xs: "14px", sm: "16px" },
                  color: "rgba(0, 0, 0, 0.65)",
                }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "stretch", sm: "flex-end" },
            mt: "20px",
          }}
        >
          <ButtonBlock
            onClick={handleEditClinic}
            style={{
              background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
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
          >
            Bearbeiten
          </ButtonBlock>
        </Box>
      </Paper>
    </Box>
  );
}
