import { Box, Grid, Paper, Stack, Typography, Alert } from "@mui/material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import TeethSelection from "../../components/TeethSelection";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTreatmentRequests } from "../../api/treatment-requests/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import PatientDetails from "../Patients/PatientDetails";
import { Add } from "@mui/icons-material";
import { useMemo } from "react";

const RequestCards = (props) => {
  const { request } = props;
  const navigate = useNavigate();

  const selectedTeeth =
    request?.operations?.flatMap(
      (operation) => operation?.selectedTeeth || []
    ) || [];

  const selectedConnectors =
    request?.operations?.flatMap((operation) => operation?.connectors || []) ||
    [];

  // Create a mapping of teeth to their operation colors
  const teethColorMap = useMemo(() => {
    const map: Record<number, string> = {};
    request?.operations?.forEach((operation) => {
      operation?.selectedTeeth?.forEach((tooth) => {
        map[tooth] = operation?.operation?.color || "#c3c3c3";
      });
    });
    return map;
  }, [request?.operations]);

  // Create a mapping of connectors to their operation colors
  const connectorsColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    request?.operations?.forEach((operation) => {
      operation?.connectors?.forEach((connector) => {
        if (connector && connector.length >= 2) {
          const connectorKey = `${connector[0]}-${connector[1]}`;
          map[connectorKey] = operation?.operation?.color || "#c3c3c3";
        }
      });
    });
    return map;
  }, [request?.operations]);

  return (
    <Grid
      key={request?._id || "unknown"}
      size={4}
      onClick={() => request?._id && navigate(`/requests/${request._id}`)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        cursor: request?._id ? "pointer" : "default",
      }}
    >
      <Box
        sx={{
          border: "2px solid rgba(10, 77, 130, 1)",
          borderRadius: "10px",
          padding: "26px",
          width: "100%",
          height: "185px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
          },
        }}
      >
        {/* <TeethSelection
                        selectedTeeth={selectedTeeth}
                        selectedConnectors={selectedConnectors}
                        teethColorMap={teethColorMap}
                        readOnly={true}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      /> */}

        <TeethSelection
          selectedTeeth={selectedTeeth}
          selectedConnectors={selectedConnectors}
          selectedOperation={request?.operations?.[0]?.operation}
          teethColorMap={teethColorMap}
          connectorsColorMap={connectorsColorMap}
          readOnly={true}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "500",
          fontSize: "12px",
          color: "rgba(120, 120, 120, 0.65)",
        }}
      >
        {request?.createdAt
          ? new Date(request.createdAt).toLocaleDateString("de-DE")
          : "-"}{" "}
        - {request?.status || "-"}
      </Typography>
    </Grid>
  );
};

export default function PatientDashboardPreview() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    data: treatmentRequests,
    isLoading,
    error,
  } = useGetTreatmentRequests({
    patient: id,
  });

  const hasData = treatmentRequests?.data && treatmentRequests.data.length > 0;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box display="flex" gap="20px">
      <Stack flex="1" flexDirection={"row"} gap="48px">
        <PatientDetails />
        <Box display="flex" flexDirection="column" flex={1} gap="20px">
          <Typography
            variant="h2"
            sx={{
              fontWeight: "600",
              fontSize: "24px",
              color: "rgba(146, 146, 146, 1)",
            }}
          >
            Patienten-Auftragensliste
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Fehler beim Laden der Aufträge. Bitte versuchen Sie es erneut.
            </Alert>
          )}

          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              padding: "26px 40px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Grid container spacing={2} sx={{ width: "100%" }}>
              {!hasData ? (
                <Grid size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      py: 8,
                      color: "rgba(146, 146, 146, 1)",
                    }}
                  >
                    <Add sx={{ fontSize: 64, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Keine Aufträge vorhanden
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: "center", opacity: 0.7 }}
                    >
                      Dieser Patient hat noch keine Behandlungsaufträge.
                      <br />
                      Erstellen Sie den ersten Auftrag.
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                treatmentRequests?.data?.map((request) => (
                  <RequestCards key={request?._id} request={request} />
                ))
              )}
            </Grid>
            <ButtonBlock
              startIcon={<Add />}
              sx={{
                borderRadius: "40px",
                textTransform: "none",
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                color: "white",
                px: "12px",
                fontWeight: "500",
                fontSize: "16px",
                height: "37px",
              }}
              onClick={() => {
                navigate(`/patients/${id}/requests/create`);
              }}
            >
              Neuer Auftrag
            </ButtonBlock>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
