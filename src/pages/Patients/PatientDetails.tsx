import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Pagination as MuiPagination,
  Skeleton,
} from "@mui/material";
import {
  CalendarToday,
  Person,
  LocalShipping,
  Assignment,
  Add,
  MedicalServices,
  Science,
} from "@mui/icons-material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useDeletePatient, useGetPatientById } from "../../api/patients/hooks";
import { useGetTreatmentRequests } from "../../api/treatment-requests/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import { isoDateToAge } from "../../utils/dateToAge";
import DateText from "../../components/atoms/DateText";
import TeethSelection from "../../components/TeethSelection";
import {
  getRequestStatusConfig,
  getLabStatusConfig,
} from "../../constants/statusConfig";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PatientDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const patientId = params?.id;

  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data: patient, isLoading } = useGetPatientById(patientId || "");
  const { mutate: deletePatient } = useDeletePatient();

  const { data: requestsData, isLoading: isLoadingRequests } =
    useGetTreatmentRequests({
      patient: patientId,
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const totalPages = requestsData?.pagination?.totalPages || 1;

  return (
    <Box display="flex" flexDirection="column" gap="20px" width="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
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
        <ButtonBlock
          startIcon={<Add />}
          sx={{
            borderRadius: "40px",
            textTransform: "none",
            background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
            color: "white",
            px: "16px",
            fontWeight: "500",
            fontSize: "16px",
            height: "40px",
          }}
          onClick={() => navigate(`/patients/${patientId}/requests/create`)}
        >
          Neuer Auftrag
        </ButtonBlock>
      </Stack>

      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: "1px solid #e0e0e0",
            "& .MuiTab-root": {
              fontSize: "16px",
              fontWeight: 500,
              textTransform: "none",
              minHeight: 56,
            },
            "& .Mui-selected": {
              color: "rgba(10, 77, 130, 1) !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "rgba(10, 77, 130, 1)",
            },
          }}
        >
          <Tab label="Patientendaten" icon={<Person />} iconPosition="start" />
          <Tab
            label={`Aufträge (${requestsData?.pagination?.totalItems || 0})`}
            icon={<Assignment />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ padding: "26px 40px" }}>
            <Stack gap="32px">
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
                  label: "Geburtsdatum",
                  value: patient?.birthDate ? (
                    <>
                      <DateText date={patient.birthDate} /> (
                      {isoDateToAge(patient.birthDate)} Jahre)
                    </>
                  ) : (
                    "-"
                  ),
                },
                {
                  label: "Liefertermin",
                  value: patient?.dueDate ? (
                    <DateText date={patient.dueDate} />
                  ) : (
                    "-"
                  ),
                },
                {
                  label: "Versicherungsart",
                  value:
                    patient?.patientType === "private"
                      ? "Privatversichert"
                      : "Gesetzlich versichert",
                },
                {
                  label: "Behandelnder Zahnarzt",
                  value: patient?.doctor
                    ? `${patient.doctor.firstName} ${patient.doctor.lastName}`
                    : "-",
                },
                {
                  label: "Patientennummer",
                  value: patient?.patientNumber || "-",
                },
                {
                  label: "Anmerkungen",
                  value: patient?.notes || "Keine Anmerkungen vorhanden",
                },
              ].map(({ label, value }) => (
                <Stack gap="8px" key={label}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "rgba(10, 77, 130, 1)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "500",
                      fontSize: "18px",
                      color: "rgba(0, 0, 0, 0.75)",
                    }}
                  >
                    {value}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Stack flexDirection="row" justifyContent="space-between" mt="32px">
              <ButtonBlock
                onClick={handleGoBackToPatients}
                style={{
                  borderRadius: "40px",
                  height: "44px",
                  color: "rgba(107, 107, 107, 1)",
                  width: "160px",
                  fontSize: "16px",
                  fontWeight: "500",
                  boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                }}
              >
                Zurück
              </ButtonBlock>

              <Box sx={{ display: "flex" }} gap="10px">
                <ButtonBlock
                  type="submit"
                  style={{
                    background: "rgba(247, 107, 107, 1)",
                    boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                    borderRadius: "40px",
                    height: "44px",
                    color: "white",
                    width: "160px",
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
                    height: "44px",
                    color: "white",
                    width: "160px",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  Bearbeiten
                </ButtonBlock>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ padding: "16px 24px 24px" }}>
            {isLoadingRequests ? (
              <Stack gap={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={140}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            ) : requestsData?.data?.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                }}
              >
                <Assignment sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">Keine Aufträge vorhanden</Typography>
                <Typography variant="body2">
                  Für diesen Patienten wurden noch keine Aufträge erstellt.
                </Typography>
              </Box>
            ) : (
              <>
                <Stack gap={2}>
                  {requestsData?.data?.map((request) => {
                    const statusConfig = getRequestStatusConfig(request.status);
                    const labStatusConfig = request.labRequest
                      ? getLabStatusConfig(request.labRequest.labStatus)
                      : null;

                    // Extract teeth and connectors from operations
                    const selectedTeeth =
                      request?.operations?.flatMap(
                        (operation) => operation?.selectedTeeth || [],
                      ) || [];

                    const selectedConnectors =
                      request?.operations?.flatMap(
                        (operation) => operation?.connectors || [],
                      ) || [];

                    // Create a mapping of teeth to their operation colors
                    const teethColorMap: Record<number, string> = {};
                    request?.operations?.forEach((operation) => {
                      operation?.selectedTeeth?.forEach((tooth) => {
                        teethColorMap[tooth] =
                          operation?.operation?.color || "#c3c3c3";
                      });
                    });

                    // Create a mapping of connectors to their operation colors
                    const connectorsColorMap: Record<string, string> = {};
                    request?.operations?.forEach((operation) => {
                      operation?.connectors?.forEach((connector) => {
                        if (connector && connector.length >= 2) {
                          const connectorKey = `${connector[0]}-${connector[1]}`;
                          connectorsColorMap[connectorKey] =
                            operation?.operation?.color || "#c3c3c3";
                        }
                      });
                    });

                    return (
                      <Card
                        key={request._id}
                        sx={{
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => navigate(`/requests/${request._id}`)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            gap={3}
                          >
                            {/* Teeth Selection Visualization */}
                            <Box
                              sx={{
                                border: "2px solid rgba(10, 77, 130, 0.3)",
                                borderRadius: "10px",
                                padding: "12px",
                                width: "140px",
                                height: "140px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <TeethSelection
                                selectedTeeth={selectedTeeth}
                                selectedConnectors={selectedConnectors}
                                selectedOperation={
                                  request?.operations?.[0]?.operation
                                }
                                teethColorMap={teethColorMap}
                                connectorsColorMap={connectorsColorMap}
                                readOnly={true}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </Box>

                            {/* Request Details */}
                            <Stack
                              direction={"column"}
                              justifyContent={"space-between"}
                              sx={{ flex: 1 }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                mb={1.5}
                              >
                                <Box>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "18px",
                                      color: "rgba(10, 77, 130, 1)",
                                    }}
                                  >
                                    {request.requestNumber}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "18px",
                                      color: "rgba(10, 77, 130, 1)",
                                    }}
                                  >
                                    {request.operations
                                      ?.map((op) => op.operation?.name)
                                      .filter(Boolean)
                                      .join(", ") || "Keine Vorgänge"}
                                  </Typography>
                                </Box>
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                  <Chip
                                    icon={
                                      <MedicalServices
                                        sx={{
                                          fontSize: 14,
                                          color: `${statusConfig.textColor} !important`,
                                        }}
                                      />
                                    }
                                    label={`Stand: ${statusConfig.label}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: statusConfig.bgColor,
                                      color: statusConfig.textColor,
                                      fontWeight: 500,
                                      fontSize: "12px",
                                    }}
                                  />
                                  {labStatusConfig && (
                                    <Chip
                                      icon={
                                        <Science
                                          sx={{
                                            fontSize: 14,
                                            color: `${labStatusConfig.textColor} !important`,
                                          }}
                                        />
                                      }
                                      label={`Labor: ${labStatusConfig.label}`}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          labStatusConfig.bgColor,
                                        color: labStatusConfig.textColor,
                                        fontWeight: 500,
                                        fontSize: "12px",
                                      }}
                                    />
                                  )}
                                </Stack>
                              </Stack>

                              <Stack
                                direction="row"
                                gap={3}
                                flexWrap="wrap"
                                sx={{ mt: 2 }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={1}
                                >
                                  <CalendarToday
                                    sx={{
                                      fontSize: 18,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Erstellt:{" "}
                                    <DateText date={request.createdAt} />
                                  </Typography>
                                </Stack>
                                {request.deliveryDate && (
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <LocalShipping
                                      sx={{
                                        fontSize: 18,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Liefertermin:{" "}
                                      <DateText date={request.deliveryDate} />
                                    </Typography>
                                  </Stack>
                                )}
                                {request.doctor && (
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Person
                                      sx={{
                                        fontSize: 18,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Zahnarzt: {request.doctor.firstName}{" "}
                                      {request.doctor.lastName}
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>

                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 3,
                    }}
                  >
                    <MuiPagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
