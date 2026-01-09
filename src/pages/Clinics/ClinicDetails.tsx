import { Box, Paper, Stack, Typography } from "@mui/material";
import { useDeleteClinic, useGetClinicById } from "../../api/clinics/hooks";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function ClinicDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const clinicId = params?.id;
  const { data: clinic, isLoading } = useGetClinicById(clinicId || "");

  const { mutate: deleteClinic } = useDeleteClinic();

  const handleEditClinic = () => {
    if (clinicId) {
      navigate(`/clinics/edit/${clinicId}`);
    }
  };

  const handleDeleteClinic = () => {
    if (clinicId) {
      deleteClinic(clinicId, {
        onSuccess() {
          navigate("/clinics");
        },
      });
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
      <Typography
        variant="h2"
        sx={{
          fontWeight: "600",
          fontSize: "24px",
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Klinikinformationen
      </Typography>

      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          padding: "26px 40px",
          //   minHeight:"750px"
        }}
      >
        <Stack gap="42px">
          {[
            {
              label: "Klinik Name",
              value: clinic?.name,
            },
            {
              label: "Straße",
              value: clinic?.street,
            },
            {
              label: "Stadt",
              value: clinic?.city,
            },
            {
              label: "Adresse",
              value: clinic?.street,
            },
            {
              label: "Nummer",
              value: clinic?.phoneNumber,
            },
            {
              label: "Notzin",
              value: clinic?.notes || "Keine Notizen verfügbar",
            },
          ].map(({ label, value }) => (
            <Stack gap="16px">
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
              onClick={handleDeleteClinic}
              //   disabled={isPending}
            >
              löschen
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
              onClick={handleEditClinic}
              //   disabled={isPending}
            >
              Bearbeiten
            </ButtonBlock>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
