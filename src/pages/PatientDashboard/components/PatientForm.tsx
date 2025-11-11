import {
  FormControl,
  FormLabel,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import ValueFieldBlock from "../../../components/molecules/form-fields/ValueFieldBlock";
import LoadingSpinner from "../../../components/atoms/LoadingSpinner";
import { useGetDoctors } from "../../../api/doctors/hooks";
import { useGetClinics } from "../../../api/clinics/hooks";
import { Fragment, useMemo, useEffect } from "react";
import SelectBlock from "../../../components/atoms/SelectBlock";
import InputBlockNoForm from "../../../components/atoms/InputBlockNoForm";
import { isoDateToAge } from "../../../utils/isoDateToAge";
import S3FileUpload, {
  S3UploadResponse,
} from "../../../components/S3FileUpload";

const PatientInformation = (props) => {
  const {
    isEditMode,
    patientData,
    setSelectedDoctor,
    selectedDoctor,
    setSelectedClinic,
    selectedClinic,
    setDeliveryDate,
    deliveryDate,
    setSelectedImpression,
    setSelectedShade,
    selectedShade,
    selectedImpression,
    onEmptyDataChange, // New prop to communicate empty state to parent
    disabled = false, // New prop to disable all fields
    attachment,
    setAttachment,
  } = props;

  const { patientNumber, firstName, lastName, gender, birthDate } =
    patientData ?? {};

  const {
    data: doctors,
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useGetDoctors();

  const {
    data: clinics,
    isLoading: clinicsLoading,
    error: clinicsError,
  } = useGetClinics();

  const doctorsOptions = useMemo(() => {
    if (!doctors?.data || !doctors?.data?.length) return [];

    return doctors?.data?.map((doctor) => ({
      label: `${doctor.firstName} ${doctor.lastName}`,
      value: doctor._id,
    }));
  }, [doctors]);

  const clinicsOptions = useMemo(() => {
    if (!clinics?.data || !clinics?.data?.length) return [];

    return clinics?.data?.map((clinic) => ({
      label: `${clinic.name}`,
      value: clinic._id,
    }));
  }, [clinics]);

  // Determine the current state
  const isLoading = doctorsLoading || clinicsLoading || !patientData;
  const hasErrors = doctorsError || clinicsError;
  const hasDoctors = doctors?.data && doctors.data.length > 0;
  const hasClinics = clinics?.data && clinics.data.length > 0;
  const hasEmptyData = !isLoading && (!hasDoctors || !hasClinics);

  // Communicate empty data state to parent
  useEffect(() => {
    if (onEmptyDataChange) {
      onEmptyDataChange(hasEmptyData, { hasDoctors, hasClinics, hasErrors });
    }
  }, [hasEmptyData, hasDoctors, hasClinics, hasErrors, onEmptyDataChange]);

  // Render loading state
  if (isLoading) {
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
          Patienteninformation
        </Typography>
        <LoadingSpinner />
      </Stack>
    );
  }

  // Render error state
  if (hasErrors) {
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
          Patienteninformation
        </Typography>
        <Alert severity="error">
          Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.
        </Alert>
      </Stack>
    );
  }

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
        Patienteninformation
      </Typography>
      <Fragment>
        <Paper
          sx={{
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 1)",
            padding: "26px 40px",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={6}>
              <ValueFieldBlock
                label="Patientenname"
                value={`${firstName} ${lastName}`}
              />
            </Grid>
            <Grid size={6}>
              <ValueFieldBlock label="Patientennummer" value={patientNumber} />
            </Grid>
            <Grid size={6}>
              <ValueFieldBlock label="Geschlecht" value={gender} />
            </Grid>
            <Grid size={6}>
              <ValueFieldBlock
                label="Geburtstag"
                value={
                  birthDate
                    ? `${new Date(birthDate).toLocaleDateString(
                        "de-DE"
                      )} ( ${isoDateToAge(birthDate)} )`
                    : ""
                }
              />
            </Grid>
          </Grid>
        </Paper>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "600",
            fontSize: "24px",
            color: "rgba(146, 146, 146, 1)",
          }}
        >
          Anfragedaten
        </Typography>
        <Paper
          sx={{
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 1)",
            padding: "26px 40px",
          }}
        >
          <S3FileUpload
            onUploadSuccess={(uploadRes: S3UploadResponse) =>
              setAttachment(uploadRes)
            }
            onRemove={() => setAttachment(null)}
            onUploadError={(error) => console.error("Upload error:", error)}
            currentFile={attachment}
          />
        </Paper>
        <Paper
          sx={{
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 1)",
            padding: "26px 40px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl
                fullWidth
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <FormLabel
                  sx={{
                    fontWeight: "400",
                    fontSize: "14px",
                    color: "rgba(10, 77, 130, 1)",
                  }}
                >
                  Zahnarzt *
                </FormLabel>
                <SelectBlock
                  placeholder={"Arzt auswählen"}
                  options={doctorsOptions}
                  onChange={(e) => {
                    const _selectedDoctor = doctorsOptions.find(
                      (doctor) => doctor.value === e.target.value
                    );
                    setSelectedDoctor(_selectedDoctor);
                  }}
                  value={selectedDoctor?.value}
                  enableClear={false}
                  disabled={isEditMode || disabled}
                />
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl
                fullWidth
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <FormLabel
                  sx={{
                    fontWeight: "400",
                    fontSize: "14px",
                    color: "rgba(10, 77, 130, 1)",
                  }}
                >
                  Praxis *
                </FormLabel>
                <SelectBlock
                  placeholder={"Praxisnamen auswählen"}
                  options={clinicsOptions}
                  onChange={(e) => {
                    const _selectedClinic = clinicsOptions.find(
                      (clinic) => clinic.value === e.target.value
                    );
                    setSelectedClinic(_selectedClinic);
                  }}
                  value={selectedClinic.value}
                  enableClear={false}
                  disabled={isEditMode || disabled}
                />
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl
                fullWidth
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <FormLabel
                  sx={{
                    fontWeight: "400",
                    fontSize: "14px",
                    color: "rgba(10, 77, 130, 1)",
                  }}
                >
                  Liefertermin *
                </FormLabel>
                <InputBlockNoForm
                  type={"date"}
                  onChange={setDeliveryDate}
                  value={
                    isEditMode
                      ? new Date(deliveryDate).toISOString().split("T")[0]
                      : deliveryDate
                  }
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 1)",
            padding: "26px 40px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl
                fullWidth
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <FormLabel
                  sx={{
                    fontWeight: "400",
                    fontSize: "14px",
                    color: "rgba(10, 77, 130, 1)",
                  }}
                >
                  Abformungsart *
                </FormLabel>
                <SelectBlock
                  enableClear={false}
                  placeholder={"Abformungsart auswählen"}
                  options={[
                    { label: "Scan", value: "scan" },
                    { label: "Abdruck", value: "abdruck" },
                  ]}
                  value={selectedImpression}
                  onChange={(e) => setSelectedImpression(e.target.value)}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl
                fullWidth
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <FormLabel
                  sx={{
                    fontWeight: "400",
                    fontSize: "14px",
                    color: "rgba(10, 77, 130, 1)",
                  }}
                >
                  Zahnfarbe
                </FormLabel>
                <SelectBlock
                  enableClear={true}
                  placeholder={"Zahnfarbe auswählen"}
                  options={[
                    { label: "A1", value: "a1" },
                    { label: "A2", value: "a2" },
                    { label: "A3", value: "a3" },
                    { label: "A3.5", value: "a3.5" },
                    { label: "A4", value: "a4" },
                    { label: "B1", value: "b1" },
                    { label: "B2", value: "b2" },
                    { label: "B3", value: "b3" },
                    { label: "B4", value: "b4" },
                    { label: "C1", value: "c1" },
                    { label: "C2", value: "c2" },
                    { label: "C3", value: "c3" },
                    { label: "C4", value: "c4" },
                    { label: "D1", value: "d1" },
                    { label: "D2", value: "d2" },
                    { label: "D3", value: "d3" },
                    { label: "D4", value: "d4" },
                    { label: "BL1", value: "bl1" },
                    { label: "BL2", value: "bl2" },
                    { label: "BL3", value: "bl3" },
                    { label: "BL4", value: "bl4" },
                  ]}
                  value={selectedShade}
                  onChange={(e) => setSelectedShade(e.target.value)}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Fragment>
    </Stack>
  );
};

export default PatientInformation;
