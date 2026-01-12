import { Paper, Stack, Typography } from "@mui/material";

export interface PatientInfo {
  name: string;
  id: string;
  type: "Privat" | "GKV";
  dob: string;
  gender: "Masculin" | "Feminin";
}

const PatientInfoCard: React.FC<{ info: PatientInfo }> = ({ info }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: "10px",
      background: "rgba(255, 255, 255, 1)",
      padding: "26px 40px",
      height: "fit-content",
    }}
  >
    <Stack
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      gap="16px"
    >
      {[
        { label: "Name", value: info.name },
        { label: "Nummer", value: info.id },
        { label: "Patiententyp", value: info.type },
        { label: "Geburtstag", value: info.dob },
        { label: "Geschlecht", value: info.gender },
      ].map((item) => (
        <Stack
          key={item.label}
          gap="10px"
          flex={1}
          sx={{ textAlign: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Paper>
);

export default PatientInfoCard;
