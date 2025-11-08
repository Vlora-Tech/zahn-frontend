import { Paper, Stack, Typography } from "@mui/material";
import TeethSelection from "../../../components/TeethSelection";

const OperationTeeth = (props) => {
  const {
    isPatientInfoComplete,
    handleSelectTooth,
    handleSelectConnector,
    selectedOperation,
    selectedTeethRequest,
    selectedConnectorsRequest,
    teethRequestColorMap,
    connectorsRequestColorMap,
    selectedTeeth,
    selectedConnectors,
    disabled = false, // New prop to disable the component
  } = props;

  const isDisabled = !isPatientInfoComplete || disabled;

  return (
    <Stack flex="1" gap="20px">
      <Typography
        variant="h2"
        sx={{
          fontWeight: "600",
          fontSize: "24px",
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        {"Zähne auswählen"}
      </Typography>
      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          padding: "26px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center",
          height: "100%",
          opacity: isDisabled ? 0.5 : 1,
          pointerEvents: isDisabled ? "none" : "auto",
        }}
      >
        {isDisabled && (
          <Typography
            variant="body1"
            sx={{
              color: "rgba(146, 146, 146, 1)",
              textAlign: "center",
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {disabled 
              ? "Bitte warten Sie, bis die erforderlichen Daten geladen sind"
              : "Bitte füllen Sie zuerst das Formular links aus"
            }
          </Typography>
        )}
        <TeethSelection
          selectedOperation={selectedOperation}
          handleSelectTooth={handleSelectTooth}
          handleSelectConnector={handleSelectConnector}
          selectedTeeth={[...selectedTeeth, ...selectedTeethRequest]}
          selectedConnectors={[
            ...selectedConnectors,
            selectedConnectorsRequest,
          ]}
          teethColorMap={teethRequestColorMap}
          connectorsColorMap={connectorsRequestColorMap}
        />
      </Paper>
    </Stack>
  );
};

export default OperationTeeth;
