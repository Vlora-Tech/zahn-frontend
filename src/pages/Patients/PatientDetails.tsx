import { Box, Paper, Stack, Typography } from "@mui/material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useDeletePatient, useGetPatientById } from "../../api/patients/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import { isoDateToAge } from "../../utils/isoDateToAge";

export default function PatientDetails() {
  const params = useParams();

  const navigate = useNavigate();

  const patientId = params?.id;

  const { data: patient, isLoading } = useGetPatientById(patientId || "");

  const { mutate: deletePatient } = useDeletePatient();

  if (isLoading) return <LoadingSpinner />;

  const handleDeletePatient = () => {
    if (patientId) {
      deletePatient(patientId, {
        onSuccess() {
          navigate("/patients");
        },
      });
    }
  };

  const handleEditPatient = () => {
    if (patientId) {
      navigate(`/patients/edit/${patientId}`);
    }
  };

  const handleGoBackToPatients = () => {
    navigate("/patients");
  };

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
        Patientenprofil
      </Typography>
      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          padding: "26px 40px",
        }}
      >
        <Stack gap="42px">
          {[
            {
              label: "Patientenname",
              value: `${patient?.firstName} ${patient?.lastName}`,
            },
            {
              label: "Geschlecht",
              value: patient?.gender === "male" ? "Männlich" : "Weiblich",
            },
            {
              label: "Geburtstag",
              value: patient?.birthDate
                ? `${new Date(patient.birthDate).toLocaleDateString(
                    "de-DE"
                  )} ( ${isoDateToAge(patient.birthDate)} )`
                : "",
            },
            {
              label: "Liefertermin",
              value: patient?.dueDate
                ? new Date(patient.dueDate).toLocaleDateString("de-DE")
                : "",
            },
            {
              label: "Patiententyp",
              value:
                patient?.patientType === "private" ? "Privat" : "Gesetzlich",
            },
            {
              label: "Zahnarzt",
              value: patient?.doctor
                ? `${patient.doctor.firstName} ${patient.doctor.lastName}`
                : "",
            },
            {
              label: "Patientennummer",
              value: patient?.patientNumber,
            },
            {
              label: "Notizen",
              value: patient?.notes || "Keine Notizen",
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
            onClick={handleGoBackToPatients}
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
              onClick={handleDeletePatient}
            >
              Löschen
            </ButtonBlock>
            <ButtonBlock
              onClick={handleEditPatient}
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
            >
              Bearbeiten
            </ButtonBlock>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
