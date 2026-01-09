import { Box, Paper, Stack, Typography } from "@mui/material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteLabTechnician,
  useGetLabTechnicianById,
} from "../../api/lab-technicians/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function LabTechnicianDetails() {
  const params = useParams();
  const id = params?.id;
  const { data: labTechnician, isLoading } = useGetLabTechnicianById(id || "");

  const { mutate: deleteLabTechnician } = useDeleteLabTechnician();
  const navigate = useNavigate();

  const handleEdit = () => {
    if (id) {
      navigate(`/lab-technicians/edit/${id}`);
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteLabTechnician(id, {
        onSuccess() {
          navigate("/lab-technicians");
        },
      });
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
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Labortechniker-Informationen
      </Typography>

      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          padding: "26px 40px",
          width: "100%",
        }}
      >
        <Stack gap="42px">
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
            {
              label: "Labor",
              value: labTechnician?.clinic?.name || "-",
            },
            {
              label: "Username",
              value: labTechnician?.username,
            },
            {
              label: "E-Mail",
              value: labTechnician?.email || "-",
            },
            {
              label: "Telefonnummer",
              value: labTechnician?.phoneNumber || "-",
            },
            {
              label: "Notizen",
              value: labTechnician?.notes || "-",
            },
          ].map(({ label, value }) => (
            <Stack gap="16px" key={label}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "400",
                  fontSize: "16px",
                  color: "rgba(10, 77, 130, 1)",
                }}
              >
                {label}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: "500",
                  fontSize: "16px",
                  color: "rgba(0, 0, 0, 0.65)",
                }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack flexDirection="row" justifyContent="space-between" mt="20px">
          <ButtonBlock
            onClick={() => {
              navigate("/lab-technicians");
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
            Zurück
          </ButtonBlock>

          <Box
            sx={{
              display: "flex",
            }}
            gap="10px"
          >
            <ButtonBlock
              type="submit"
              style={{
                background: "rgba(247, 107, 107, 1)",
                boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                borderRadius: "40px",
                height: "40px",
                color: "white",
                width: "143px",
                fontSize: "16px",
                fontWeight: "500",
              }}
              onClick={handleDelete}
            >
              Löschen
            </ButtonBlock>

            <ButtonBlock
              type="submit"
              style={{
                background: "rgba(10, 77, 130, 1)",
                boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                borderRadius: "40px",
                height: "40px",
                color: "white",
                width: "143px",
                fontSize: "16px",
                fontWeight: "500",
              }}
              onClick={handleEdit}
            >
              Bearbeiten
            </ButtonBlock>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
