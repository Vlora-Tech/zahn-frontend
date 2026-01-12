import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserById } from "../../api/users/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function UserDetails() {
  const params = useParams();
  const userId = params?.id;
  const { data: user, isLoading } = useGetUserById(userId as string);
  const navigate = useNavigate();

  const handleEditUser = () => {
    if (userId) {
      navigate(`/nurses/edit/${userId}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Pflegefachkraft nicht gefunden</Typography>
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
          Pflegefachkraftinformationen
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
            { label: "Name", value: user?.firstName + " " + user?.lastName },
            {
              label: "Geschlecht",
              value:
                user?.gender === "male"
                  ? "Männlich"
                  : user?.gender === "female"
                    ? "Weiblich"
                    : user?.gender,
            },
            {
              label: "Klinik",
              value:
                typeof user?.clinic === "object" ? user?.clinic?.name : "-",
            },
            { label: "Username", value: user?.username },
            { label: "E-Mail", value: user?.email || "-" },
            { label: "Telefonnummer", value: user?.phoneNumber || "-" },
            { label: "Notizen", value: user?.notes || "-" },
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
            onClick={handleEditUser}
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
