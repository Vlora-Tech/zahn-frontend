import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useGetDoctorById } from "../../api/doctors/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function DoctorDetails() {
  const params = useParams();
  const doctorId = params?.id;
  const { data: doctor, isLoading } = useGetDoctorById(doctorId || "");
  const navigate = useNavigate();

  const handleEditDoctor = () => {
    if (doctorId) {
      navigate(`/doctors/edit/${doctorId}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!doctor && !isLoading) {
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
          onClick={() => navigate("/doctors")}
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
          Zahnarztinformationen
        </Typography>
      </Box>

      <Paper
        sx={{
          borderRadius: { xs: 0, sm: "10px" },
          background: "rgba(255, 255, 255, 1)",
          padding: { xs: "16px", sm: "26px 40px" },
          width: "100%",
        }}
      >
        <Stack gap={{ xs: "24px", sm: "42px" }}>
          {[
            {
              label: "Name",
              value: doctor?.firstName + " " + doctor?.lastName,
            },
            {
              label: "Geschlecht",
              value:
                doctor?.gender === "male"
                  ? "Männlich"
                  : doctor?.gender === "female"
                    ? "Weiblich"
                    : doctor?.gender,
            },
            {
              label: "Klinik",
              value:
                typeof doctor?.clinic === "object" ? doctor?.clinic?.name : "-",
            },
            { label: "Username", value: doctor?.username },
            { label: "E-Mail", value: doctor?.email || "-" },
            { label: "Telefonnummer", value: doctor?.phoneNumber || "-" },
            { label: "Notizen", value: doctor?.notes || "-" },
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
            onClick={handleEditDoctor}
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
