import { useMemo } from "react";
import {
  Stack,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Avatar,
  Alert,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  Print,
  Inventory2,
  Person,
  LocalHospital,
  Assignment,
  AccessTime,
  Schedule,
  Badge,
  MedicalServices,
  VolunteerActivism,
  MedicalInformation,
  Wc,
  Cake,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

import { useLaborzettel } from "../../api/laborzettel/hooks";
import {
  PopulatedLabRequest,
  InventoryLotUsage,
} from "../../api/laborzettel/types";
import { InventoryMaterial } from "../../api/inventory/types";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import DateText from "../../components/atoms/DateText";
import { formatDateDE } from "../../utils/formatDate";
import { isoDateToAge } from "../../utils/dateToAge";
import LabStatusChip from "./components/LabStatusChip";
import RequestSummary from "../PatientDashboard/components/RequestSummary";
import { OperationSchema } from "../PatientDashboard";

// Import the laborzettel data for structure
import laborzettelData from "../../data/krone-gkv.json";

interface LaborzettelSectionData {
  section: string;
  items: { number: string; name: string; defaultValue: string }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`laborzettel-tabpanel-${index}`}
      aria-labelledby={`laborzettel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const LaborzettelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState(0);

  const { data: laborzettel, isLoading, error } = useLaborzettel(id || "");

  const handleGoBack = () => navigate("/laborzettel");
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  // Get populated lab request data
  const labRequest = laborzettel?.labRequest as PopulatedLabRequest | undefined;
  const request = labRequest?.request;
  const patient = request?.patient;
  const doctor = request?.doctor;
  const clinic = request?.clinic;

  // Build menge values map from laborzettel sections
  const mengeValues = useMemo(() => {
    const values: Record<string, string> = {};
    laborzettel?.sections?.forEach((section) => {
      section.items.forEach((item) => {
        values[item.number] = item.menge;
      });
    });
    return values;
  }, [laborzettel]);

  // Transform operations for display
  const configuredOperations = useMemo((): OperationSchema[] => {
    if (!request?.operations) return [];
    return request.operations.map((operation, index) => ({
      operationIdx: String(index),
      selectedTeeth: operation?.selectedTeeth || [],
      operation: {
        ...operation.operation,
        label: operation.operation?.name || "Unbekannte Operation",
        color: operation.operation?.color || "#c3c3c3",
        id: operation.operation?._id || `operation-${index}`,
        category: "Unbekannte Kategorie",
      },
      material: { id: "", name: "" },
      optionsAndParameters: {},
      connectors: [],
    }));
  }, [request]);

  const selectedTeethRequest = useMemo(() => {
    return configuredOperations.flatMap((op) => op.selectedTeeth || []);
  }, [configuredOperations]);

  const teethRequestColorMap = useMemo(() => {
    const colorMap: Record<number, string> = {};
    configuredOperations.forEach((op) => {
      const color = op.operation?.color || "#c3c3c3";
      op.selectedTeeth?.forEach((tooth) => {
        colorMap[tooth] = color;
      });
    });
    return colorMap;
  }, [configuredOperations]);

  const handlePrint = () => {
    if (!laborzettel) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Laborzettel ${laborzettel.laborzettelNumber}`,
      pageWidth / 2,
      yPos,
      {
        align: "center",
      },
    );
    yPos += 15;

    // Header Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const headerData = [
      [
        "Vorgang",
        request?.operations
          ?.map((op) => op.operation?.name)
          .filter(Boolean)
          .join(", ") || "-",
      ],
      ["Praxis", clinic?.name || "-"],
      ["Zahnarzt", doctor ? `${doctor.firstName} ${doctor.lastName}` : "-"],
      ["Patient", patient ? `${patient.firstName} ${patient.lastName}` : "-"],
      ["Patientennummer", patient?.patientNumber || "-"],
      ["Auftrag Nr.", request?.requestNumber || "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: headerData,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 100 },
      },
      margin: { left: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Lot Number
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Lot Nr.: ${laborzettel.lotNr}`, 20, yPos);
    yPos += 10;

    // Selected Inventory Lots
    if (
      laborzettel.inventoryLotUsages &&
      laborzettel.inventoryLotUsages.length > 0
    ) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Verwendete Materialien:", 20, yPos);
      yPos += 5;

      const lotsData = laborzettel.inventoryLotUsages.map(
        (usage: InventoryLotUsage) => {
          const material =
            typeof usage.lot.material === "string"
              ? usage.lot.material
              : (usage.lot.material as InventoryMaterial).name;
          return [
            material,
            usage.lot.lotNumber,
            `${usage.quantityUsed} ${usage.lot.unit}`,
            usage.lot.expiryDate ? formatDateDE(usage.lot.expiryDate) : "-",
          ];
        },
      );

      autoTable(doc, {
        startY: yPos,
        head: [["Material", "Chargennr.", "Menge verwendet", "Ablaufdatum"]],
        body: lotsData,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [104, 201, 242], fontStyle: "bold" },
        margin: { left: 20, right: 20 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Sections with items
    (laborzettelData as LaborzettelSectionData[]).forEach((section) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, pageWidth - 40, 8, "F");
      doc.text(section.section, 22, yPos);
      yPos += 8;

      const tableData = section.items.map((item) => [
        item.number,
        item.name,
        mengeValues[item.number] || item.defaultValue,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["L-Nr.", "Leistung", "Menge"]],
        body: tableData,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [92, 107, 192], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 110 },
          2: { cellWidth: 25, halign: "center" },
        },
        margin: { left: 20, right: 20 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;
    });

    const fileName = `Laborzettel_${request?.requestNumber || "unknown"}_${laborzettel.lotNr}.pdf`;
    doc.save(fileName);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error || !laborzettel) {
    return (
      <Stack flex="1" gap="20px" height="100%">
        <Alert severity="error">
          {error
            ? "Fehler beim Laden des Laborzettels."
            : "Laborzettel nicht gefunden."}
        </Alert>
        <ButtonBlock
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          style={{
            borderRadius: "40px",
            height: "40px",
            color: "rgba(107, 107, 107, 1)",
            width: "200px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Zurück zur Liste
        </ButtonBlock>
      </Stack>
    );
  }

  return (
    <Stack flex="1" gap="16px" height="100%">
      {/* Top Section: Hero Card + Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "16px",
          alignItems: { xs: "stretch", md: "stretch" },
        }}
      >
        {/* Hero Card */}
        <Paper
          sx={{
            flex: 1,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Row 1: Back Button + Laborzettel Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              p: 2.5,
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              gap: { xs: 2, md: 3 },
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={handleGoBack}
              sx={{
                backgroundColor: "white",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                "&:hover": { backgroundColor: "rgba(245,245,245,1)" },
                alignSelf: { xs: "flex-start", md: "center" },
                flexShrink: 0,
              }}
            >
              <ArrowBack />
            </IconButton>

            {/* Laborzettel Info - horizontal on desktop */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                gap: { xs: 1.5, md: 3 },
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              {/* Laborzettel Number */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(92, 107, 192, 0.15)",
                    color: "rgba(92, 107, 192, 1)",
                  }}
                >
                  <Assignment sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color: "rgba(33, 33, 33, 1)",
                  }}
                >
                  {laborzettel.laborzettelNumber}
                </Typography>
              </Box>

              {/* Status */}
              {labRequest?.labStatus && (
                <LabStatusChip status={labRequest.labStatus} />
              )}

              {/* Erstellt */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime
                  sx={{
                    fontSize: 18,
                    color: "rgba(104, 201, 242, 1)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "16px",
                  }}
                >
                  Erstellt:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: "16px" }}
                >
                  <DateText date={laborzettel.createdAt} showTime />
                </Typography>
              </Box>

              {/* Liefertermin */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Schedule
                  sx={{
                    fontSize: 18,
                    color: "rgba(104, 201, 242, 1)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "16px",
                  }}
                >
                  Liefertermin:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: "16px" }}
                >
                  {request?.deliveryDate ? (
                    <DateText date={request.deliveryDate} />
                  ) : (
                    "—"
                  )}
                </Typography>
              </Box>

              {/* Auftrag Nr. */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <MedicalInformation
                  sx={{
                    fontSize: 18,
                    color: "rgba(255, 152, 0, 1)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "16px",
                  }}
                >
                  Auftrag:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  {request?.requestNumber || "—"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Row 2: Patient + Praxis - side by side on desktop */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Patient Section */}
            <Box
              sx={{
                flex: 1,
                p: 2.5,
                borderRight: { xs: "none", md: "1px solid rgba(0,0,0,0.05)" },
                borderBottom: { xs: "1px solid rgba(0,0,0,0.05)", md: "none" },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(104, 201, 242, 0.15)",
                    color: "rgba(104, 201, 242, 1)",
                  }}
                >
                  <Person sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "rgba(33, 33, 33, 1)" }}
                >
                  {patient ? `${patient.firstName} ${patient.lastName}` : "—"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1.5, md: 3 },
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Badge
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Patientennr.
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {patient?.patientNumber || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Wc
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Geschlecht
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {(patient as any)?.gender === "male"
                      ? "Männlich"
                      : (patient as any)?.gender === "female"
                        ? "Weiblich"
                        : (patient as any)?.gender || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Cake
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Geburtsdatum
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {(patient as any)?.birthDate ? (
                      <>
                        <DateText date={(patient as any).birthDate} /> (
                        {isoDateToAge((patient as any).birthDate)} J.)
                      </>
                    ) : (
                      "—"
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Praxis Section */}
            <Box sx={{ flex: 1, p: 2.5 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(135, 193, 51, 0.15)",
                    color: "rgba(135, 193, 51, 1)",
                  }}
                >
                  <LocalHospital sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "rgba(33, 33, 33, 1)" }}
                >
                  {clinic?.name || "—"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1.5, md: 3 },
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <MedicalServices
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Zahnarzt
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {doctor ? `${doctor.firstName} ${doctor.lastName}` : "—"}
                  </Typography>
                </Box>
                {(labRequest?.assignedTechnicianName ||
                  labRequest?.assignedTechnician) && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(107, 107, 107, 1)",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      <Person
                        sx={{
                          fontSize: 12,
                          mr: 0.5,
                          color: "rgba(104, 201, 242, 1)",
                          verticalAlign: "middle",
                        }}
                      />
                      Labortechniker
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {labRequest.assignedTechnicianName ||
                        (labRequest.assignedTechnician
                          ? `${labRequest.assignedTechnician.firstName} ${labRequest.assignedTechnician.lastName}`
                          : "—")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Paper
          sx={{
            borderRadius: "12px",
            background: "white",
            overflow: "hidden",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
            width: { xs: "100%", md: 200 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              flex: 1,
            }}
          >
            <ButtonBlock
              onClick={handlePrint}
              style={{
                borderRadius: "8px",
                flex: 1,
                color: "white",
                background: "linear-gradient(90deg, #5C6BC0 0%, #7986CB 100%)",
                width: "100%",
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "600",
                boxShadow: "0px 2px 4px rgba(92, 107, 192, 0.3)",
                flexDirection: isMobile ? "row" : "column",
                gap: "8px",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "44px",
                padding: isMobile ? "12px 16px" : undefined,
              }}
            >
              <Print sx={{ fontSize: isMobile ? 24 : 48 }} />
              PDF drucken
            </ButtonBlock>
          </Box>
        </Paper>
      </Box>

      {/* Lot Nr. and Inventory */}
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          p: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Primäre Lot Nr.
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontFamily: "monospace", fontWeight: 500 }}
            >
              {laborzettel.lotNr}
            </Typography>
          </Box>

          {laborzettel.inventoryLotUsages &&
            laborzettel.inventoryLotUsages.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Inventory2
                    fontSize="small"
                    sx={{ color: "rgba(104, 201, 242, 1)" }}
                  />
                  Verwendete Materialien aus Inventar
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: "rgba(104, 201, 242, 0.1)" }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Chargennr.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Menge verwendet
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Ablaufdatum
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {laborzettel.inventoryLotUsages.map(
                        (usage: InventoryLotUsage) => {
                          const material =
                            typeof usage.lot.material === "string"
                              ? usage.lot.material
                              : (usage.lot.material as InventoryMaterial).name;
                          return (
                            <TableRow key={usage.lot._id} hover>
                              <TableCell>{material}</TableCell>
                              <TableCell sx={{ fontFamily: "monospace" }}>
                                {usage.lot.lotNumber}
                              </TableCell>
                              <TableCell>
                                {usage.quantityUsed} {usage.lot.unit}
                              </TableCell>
                              <TableCell
                                sx={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                {usage.lot.expiryDate
                                  ? formatDateDE(usage.lot.expiryDate)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
        </Stack>
      </Paper>

      {/* Tabs Section */}
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="laborzettel details tabs"
          >
            <Tab
              icon={<VolunteerActivism sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Leistungen"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
            <Tab
              icon={<MedicalServices sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Vorgänge"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, flex: 1, overflow: "auto" }}>
          {/* Tab 1: Leistungen */}
          <TabPanel value={activeTab} index={0}>
            <Stack gap={2}>
              {(laborzettelData as LaborzettelSectionData[]).map((section) => (
                <Paper
                  key={section.section}
                  sx={{
                    borderRadius: "12px",
                    background: "white",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      background:
                        "linear-gradient(90deg, rgba(135, 193, 51, 0.1) 0%, rgba(104, 201, 242, 0.1) 100%)",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      {section.section}
                    </Typography>
                  </Box>
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 450 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                          <TableCell sx={{ fontWeight: 600, width: 80 }}>
                            L-Nr.
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, width: 300 }}>
                            Leistung
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              width: 70,
                              textAlign: "center",
                            }}
                          >
                            Menge
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {section.items.map((item) => (
                          <TableRow key={item.number} hover>
                            <TableCell
                              sx={{
                                fontFamily: "monospace",
                                color: "rgba(107, 107, 107, 1)",
                              }}
                            >
                              {item.number}
                            </TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell
                              sx={{ textAlign: "center", fontWeight: 500 }}
                            >
                              {mengeValues[item.number] || item.defaultValue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ))}
            </Stack>
          </TabPanel>

          {/* Tab 2: Operations */}
          <TabPanel value={activeTab} index={1}>
            <RequestSummary
              selectedShade=""
              selectedImpression=""
              configuredOperations={configuredOperations}
              selectedTeethRequest={selectedTeethRequest}
              selectedConnectorsRequest={[]}
              teethRequestColorMap={teethRequestColorMap}
              connectorsRequestColorMap={{}}
              handleEditOperation={() => {}}
              handleDeleteOperation={() => {}}
              handleEditPatientInfo={() => {}}
              hideActionButtons={true}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Stack>
  );
};

export default LaborzettelDetail;
