import { Grid, Paper, Stack, Typography } from "@mui/material";
import ButtonBlock from "../../../../components/atoms/ButtonBlock";
import { Edit } from "@mui/icons-material";
import TextFieldBlockNoForm from "../../../../components/molecules/form-fields/TextFieldBlockNoForm";
import { isoDateToAge } from "../../../../utils/dateToAge";
import { formatDateDE } from "../../../../utils/formatDate";
import DateText from "../../../../components/atoms/DateText";

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  type: "Privat" | "GKV";
  birthDate: string;
  gender: "Masculin" | "Feminin";
  doctor: any;
  clinic: any;
  deliveryDate: string;
  insurance: string;
  notes: string;
}

const PatientInfoCard: React.FC<{
  patientData: PatientInfo;
  handleEditPatientInfo?: () => void;
  hideEditButton?: boolean;
  notes;
  setNotes;
}> = ({
  patientData,
  handleEditPatientInfo,
  hideEditButton = false,
  setNotes,
  notes,
}) => (
  <Stack flexDirection={"row"} gap={"20px"}>
    <Paper
      variant="outlined"
      sx={{
        width: "fit-content",
        display: "flex",
        flexDirection: "row",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 1)",
        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
        padding: "24px",
      }}
    >
      <Stack
        flexDirection={"column"}
        justifyContent={"space-between"}
        padding={1}
      >
        <Stack
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          flexWrap={"wrap"}
        >
          {[
            {
              label: "Patientenname",
              value: `${patientData.firstName} ${patientData.lastName}`,
            },
            { label: "Patientennummer", value: patientData.patientNumber },
            { 
              label: "Geschlecht", 
              value: patientData.gender === "male" ? "Männlich" : 
                     patientData.gender === "female" ? "Weiblich" : 
                     patientData.gender === "other" ? "Divers" : 
                     patientData.gender || ""
            },
            {
              label: "Geburtstag",
              value: patientData.birthDate ? (
                <><DateText date={patientData.birthDate} /> ( {isoDateToAge(patientData.birthDate)} J. )</>
              ) : "-",
            },
          ].map((item) => (
            <Stack key={item.label} sx={{ textAlign: "left", width: "250px" }}>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          flexWrap={"wrap"}
        >
          {[
            { label: "Zahnarzt", value: patientData.doctor.label },
            { label: "Praxis", value: patientData.clinic.label },
            {
              label: "Liefertermin",
              value: <DateText date={patientData.deliveryDate} />,
            },
          ].map((item) => (
            <Stack key={item.label} sx={{ textAlign: "left", width: "250px" }}>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
          {!hideEditButton && handleEditPatientInfo && (
            <ButtonBlock
              startIcon={<Edit />}
              onClick={handleEditPatientInfo}
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
              Bearbeiten
            </ButtonBlock>
          )}
        </Stack>
      </Stack>
    </Paper>
    <Paper
      variant="outlined"
      sx={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 1)",
        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
        padding: "24px",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Notizen
      </Typography>
      <Grid columns={12} padding={1}>
        <TextFieldBlockNoForm
          name="notes"
          multiline={true}
          rows={3}
          value={notes}
          onChange={setNotes}
          sx={{ width: "100%" }}
        />
      </Grid>
    </Paper>
  </Stack>
);

export default PatientInfoCard;
