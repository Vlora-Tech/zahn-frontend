import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useGetLabTechnicianById } from "../../api/lab-technicians/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function LabTechnicianDetails() {
  const params = useParams();
  const id = params?.id;
  const { data: labTechnician, isLoading } = useGetLabTechnicianById(id || "");
  const navigate = useNavigate();

  const handleEdit = () => {
    if (id) {
      navigate(`/lab-technicians/edit/${id}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!labTechnician && !isLoading) {
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
          onClick={() => navigate("/lab-technicians")}
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
          Labortechniker-Informationen
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
              value: labTechnician?.firstName + " " + labTechnician?.lastName,
            },
            {
              label: "Geschlecht",
              value:
                labTechnician?.gender === "male"
                  ? "Männlich"
                  : labTechnician?.gender === "female"
                    ? "Weiblich"
                    : labTechnician?.gender,
            },
            { label: "Labor", value: labTechnician?.clinic?.name || "-" },
            { label: "Username", value: labTechnician?.username },
            { label: "E-Mail", value: labTechnician?.email || "-" },
            {
              label: "Telefonnummer",
              value: labTechnician?.phoneNumber || "-",
            },
            { label: "Notizen", value: labTechnician?.notes || "-" },
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
            onClick={handleEdit}
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
