import { Box, Paper, Stack, Typography } from "@mui/material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteDoctor, useGetDoctorById } from "../../api/doctors/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function DoctorDetails() {
  const params = useParams();
  const doctorId = params?.id;
  const { data: doctor, isLoading } = useGetDoctorById(doctorId || "");

  const { mutate: deleteDoctor } = useDeleteDoctor();
  const navigate = useNavigate();

  const handleEditDoctor = () => {
    if (doctorId) {
      navigate(`/doctors/edit/${doctorId}`);
    }
  };

  const handleDeleteDoctor = () => {
    if (doctorId) {
      deleteDoctor(doctorId, {
        onSuccess() {
          navigate("/doctors");
        },
      });
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
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Zahnarztinformationen
      </Typography>

      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          padding: "26px 40px",
          //   minHeight:"750px"
          width: "100%",
        }}
      >
        <Stack gap="42px">
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
            {
              label: "Username",
              value: doctor?.username,
            },
            {
              label: "E-Mail",
              value: doctor?.email || "-",
            },
            {
              label: "Telefonnummer",
              value: doctor?.phoneNumber || "-",
            },
            {
              label: "Notizen",
              value: doctor?.notes || "-",
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
              navigate("/clinics");
            }}
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
              onClick={handleDeleteDoctor}
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
              onClick={handleEditDoctor}
            >
              Bearbeiten
            </ButtonBlock>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
