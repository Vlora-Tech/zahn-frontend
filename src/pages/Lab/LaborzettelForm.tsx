import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Paper,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Backdrop,
  CircularProgress,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Print,
  Save,
  Edit,
  Inventory2,
  Delete,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useLabRequest } from "../../api/lab-requests/hooks";
import {
  useLaborzettelByLabRequest,
  useCreateLaborzettel,
  useUpdateLaborzettel,
} from "../../api/laborzettel/hooks";
import {
  LeistungSection,
  InventoryLotUsageDto,
} from "../../api/laborzettel/types";
import { useLots } from "../../api/inventory/hooks";
import { InventoryLot, InventoryMaterial } from "../../api/inventory/types";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { formatDateDE } from "../../utils/formatDate";

// Import the laborzettel data
import laborzettelData from "../../data/krone-gkv.json";

interface LaborzettelItem {
  number: string;
  name: string;
  defaultValue: string;
}

interface LaborzettelSectionData {
  section: string;
  items: LaborzettelItem[];
}

// Interface for selected lot with quantity
interface SelectedLotWithQuantity {
  lot: InventoryLot;
  quantityUsed: number;
}

const LaborzettelForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: labRequest, isLoading: isLoadingLabRequest } = useLabRequest(
    id || "",
  );
  const { data: existingLaborzettel, isLoading: isLoadingLaborzettel } =
    useLaborzettelByLabRequest(id || "");

  const createMutation = useCreateLaborzettel();
  const updateMutation = useUpdateLaborzettel();

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(true);

  // State for Lot Nr. (primary lot number - manual entry)
  const [lotNr, setLotNr] = useState("");

  // State for selected inventory lots with quantities
  const [selectedLotsWithQuantity, setSelectedLotsWithQuantity] = useState<
    SelectedLotWithQuantity[]
  >([]);

  // Fetch available lots from inventory
  const { data: availableLots } = useLots({ inStockOnly: true });

  // Calculate total teeth count from the request
  const teethCount =
    labRequest?.request?.operations?.reduce((total: number, op: any) => {
      return total + (op.selectedTeeth?.length || 0);
    }, 0) || 0;

  // Helper to get the actual default value (replacing "teethCount" with actual count)
  const getDefaultValue = (defaultValue: string): string => {
    if (defaultValue === "teethCount") {
      return String(teethCount);
    }
    return defaultValue;
  };

  // State for Menge values - keyed by item number
  const [mengeValues, setMengeValues] = useState<Record<string, string>>({});

  // Initialize menge values when labRequest is loaded (to get teethCount)
  useEffect(() => {
    if (labRequest && !existingLaborzettel) {
      const initial: Record<string, string> = {};
      const currentTeethCount =
        labRequest?.request?.operations?.reduce((total: number, op: any) => {
          return total + (op.selectedTeeth?.length || 0);
        }, 0) || 0;

      (laborzettelData as LaborzettelSectionData[]).forEach((section) => {
        section.items.forEach((item) => {
          if (item.defaultValue === "teethCount") {
            initial[item.number] = String(currentTeethCount);
          } else {
            initial[item.number] = item.defaultValue;
          }
        });
      });
      setMengeValues(initial);
    }
  }, [labRequest, existingLaborzettel]);

  // Load existing data when laborzettel is fetched
  useEffect(() => {
    if (existingLaborzettel) {
      setLotNr(existingLaborzettel.lotNr);
      setIsEditMode(false);

      // Load menge values from existing laborzettel
      const loadedMengeValues: Record<string, string> = {};
      existingLaborzettel.sections.forEach((section) => {
        section.items.forEach((item) => {
          loadedMengeValues[item.number] = item.menge;
        });
      });
      setMengeValues(loadedMengeValues);

      // Load inventory lot usages with quantities
      if (
        existingLaborzettel.inventoryLotUsages &&
        existingLaborzettel.inventoryLotUsages.length > 0
      ) {
        setSelectedLotsWithQuantity(
          existingLaborzettel.inventoryLotUsages.map((usage) => ({
            lot: usage.lot as InventoryLot,
            quantityUsed: usage.quantityUsed,
          })),
        );
      } else if (existingLaborzettel.inventoryLots) {
        // Legacy: load from inventoryLots without quantity
        setSelectedLotsWithQuantity(
          existingLaborzettel.inventoryLots.map((lot) => ({
            lot: lot as InventoryLot,
            quantityUsed: 0,
          })),
        );
      }
    }
  }, [existingLaborzettel]);

  const handleMengeChange = (itemNumber: string, value: string) => {
    setMengeValues((prev) => ({
      ...prev,
      [itemNumber]: value,
    }));
  };

  const handleGoBack = () => {
    navigate(`/lab/requests/${id}`);
  };

  const buildSectionsData = (): LeistungSection[] => {
    return (laborzettelData as LaborzettelSectionData[]).map((section) => ({
      section: section.section,
      items: section.items.map((item) => ({
        number: item.number,
        name: item.name,
        menge: mengeValues[item.number] || getDefaultValue(item.defaultValue),
      })),
    }));
  };

  const handleSave = () => {
    if (!id || !lotNr.trim()) return;

    const sectionsData = buildSectionsData();
    const inventoryLotUsages: InventoryLotUsageDto[] = selectedLotsWithQuantity
      .filter((item) => item.quantityUsed > 0)
      .map((item) => ({
        lotId: item.lot._id,
        quantityUsed: item.quantityUsed,
      }));

    if (existingLaborzettel) {
      // Update existing
      updateMutation.mutate(
        {
          id: existingLaborzettel._id,
          data: {
            lotNr,
            sections: sectionsData,
            inventoryLotUsages,
          },
        },
        {
          onSuccess: () => {
            setIsEditMode(false);
          },
        },
      );
    } else {
      // Create new
      createMutation.mutate(
        {
          labRequestId: id,
          lotNr,
          sections: sectionsData,
          inventoryLotUsages,
        },
        {
          onSuccess: () => {
            setIsEditMode(false);
          },
        },
      );
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handlePrint = () => {
    if (!labRequest) return;

    const { request } = labRequest;
    const patient = request?.patient;
    const doctor = request?.doctor;
    const clinic = request?.clinic || labRequest?.clinic;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Laborzettel ${existingLaborzettel?.laborzettelNumber || ""}`,
      pageWidth / 2,
      yPos,
      { align: "center" },
    );
    yPos += 15;

    // Header Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const headerData = [
      [
        "Vorgang",
        request?.operations
          ?.map((op: any) => op.operation?.name)
          .filter(Boolean)
          .join(", ") || "-",
      ],
      ["Praxis", clinic?.name || "-"],
      ["Zahnarzt", doctor ? `${doctor.firstName} ${doctor.lastName}` : "-"],
      ["Patient", patient ? `${patient.firstName} ${patient.lastName}` : "-"],
      ["Patientennummer", patient?.patientNumber || "-"],
      ["Auftrag Nr.", request?.requestNumber || "-"],
      ["Abformung", request?.impression || "-"],
      ["Zahnfarbe", request?.shade || "-"],
      ["Versicherung", request?.insurance === "private" ? "Privat" : "GKV"],
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
    doc.text(`Lot Nr.: ${lotNr}`, 20, yPos);
    yPos += 10;

    // Selected Inventory Lots (if any)
    if (selectedLotsWithQuantity.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Verwendete Materialien:", 20, yPos);
      yPos += 5;

      const lotsData = selectedLotsWithQuantity.map((item) => {
        const material =
          typeof item.lot.material === "string"
            ? item.lot.material
            : (item.lot.material as InventoryMaterial).name;
        return [
          material,
          item.lot.lotNumber,
          `${item.quantityUsed} ${item.lot.unit}`,
          item.lot.expiryDate ? formatDateDE(item.lot.expiryDate) : "-",
        ];
      });

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
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Section header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, pageWidth - 40, 8, "F");
      doc.text(section.section, 22, yPos);
      yPos += 8;

      // Section items table
      const tableData = section.items.map((item) => [
        item.number,
        item.name,
        mengeValues[item.number] || getDefaultValue(item.defaultValue),
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

    // Save the PDF
    const fileName = `Laborzettel_${request?.requestNumber || "unknown"}_${lotNr}.pdf`;
    doc.save(fileName);
  };

  const isLoading = isLoadingLabRequest || isLoadingLaborzettel;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!labRequest) {
    return (
      <Stack flex="1" gap="20px" height="100%">
        <Typography>Laborauftrag nicht gefunden.</Typography>
      </Stack>
    );
  }

  const canSave = lotNr.trim().length > 0;
  const isSaved = !!existingLaborzettel && !isEditMode;

  return (
    <Stack flex="1" gap="16px" height="100%">
      {/* Loading overlay */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSaving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Back button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          backgroundColor: "white",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          "&:hover": { backgroundColor: "rgba(245,245,245,1)" },
          zIndex: 10,
          alignSelf: "flex-start",
          mb: 1,
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* Header */}
      <Paper
        sx={{
          borderRadius: "12px",
          background:
            "linear-gradient(90deg, rgba(92, 107, 192, 0.1) 0%, rgba(121, 134, 203, 0.1) 100%)",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#5C6BC0",
              fontSize: { xs: "18px", sm: "24px" },
            }}
          >
            Laborzettel{" "}
            {isSaved ? existingLaborzettel?.laborzettelNumber : "erstellen"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Auftrag: {labRequest.request?.requestNumber || "-"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {isEditMode ? (
            // Show Save button in edit mode
            <ButtonBlock
              onClick={handleSave}
              disabled={!canSave || isSaving}
              startIcon={<Save />}
              style={{
                borderRadius: "8px",
                height: "44px",
                color: "white",
                background: canSave
                  ? "linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)"
                  : "#ccc",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: canSave
                  ? "0px 2px 4px rgba(76, 175, 80, 0.3)"
                  : "none",
                padding: "0 24px",
              }}
            >
              Speichern
            </ButtonBlock>
          ) : (
            // Show Edit and Print buttons when saved
            <>
              <ButtonBlock
                onClick={handleEdit}
                startIcon={<Edit />}
                style={{
                  borderRadius: "8px",
                  height: "44px",
                  color: "#5C6BC0",
                  background: "white",
                  border: "1px solid #5C6BC0",
                  fontSize: "14px",
                  fontWeight: "600",
                  padding: "0 24px",
                }}
              >
                Bearbeiten
              </ButtonBlock>
              <ButtonBlock
                onClick={handlePrint}
                startIcon={<Print />}
                style={{
                  borderRadius: "8px",
                  height: "44px",
                  color: "white",
                  background:
                    "linear-gradient(90deg, #5C6BC0 0%, #7986CB 100%)",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0px 2px 4px rgba(92, 107, 192, 0.3)",
                  padding: "0 24px",
                }}
              >
                PDF drucken
              </ButtonBlock>
            </>
          )}
        </Box>
      </Paper>

      {/* Lot Nr. Field and Inventory Lots */}
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={3}>
          {/* Primary Lot Nr. */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Primäre Lot Nr. *
            </Typography>
            <TextField
              label="Lot Nr."
              value={lotNr}
              onChange={(e) => setLotNr(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: { xs: "100%", sm: 300 } }}
              required
              disabled={!isEditMode}
              helperText={
                isEditMode && !lotNr.trim()
                  ? "Lot Nr. eingeben um zu speichern"
                  : ""
              }
            />
          </Box>

          {/* Inventory Lots Selection */}
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

            {isEditMode && (
              <Autocomplete
                options={
                  availableLots?.filter(
                    (lot) =>
                      !selectedLotsWithQuantity.find(
                        (s) => s.lot._id === lot._id,
                      ),
                  ) || []
                }
                getOptionLabel={(lot) => {
                  const material =
                    typeof lot.material === "string"
                      ? lot.material
                      : (lot.material as InventoryMaterial).name;
                  return `${lot.lotNumber} - ${material} (${lot.currentQuantity} ${lot.unit} verfügbar)`;
                }}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setSelectedLotsWithQuantity((prev) => [
                      ...prev,
                      { lot: newValue, quantityUsed: 0 },
                    ]);
                  }
                }}
                value={null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Material/Charge hinzufügen"
                    placeholder="Suchen..."
                    size="small"
                    sx={{ width: "100%", maxWidth: { sm: 500 } }}
                  />
                )}
                renderOption={(props, lot) => {
                  const material =
                    typeof lot.material === "string"
                      ? lot.material
                      : (lot.material as InventoryMaterial).name;
                  const isLowStock = lot.status === "low_stock";
                  return (
                    <li {...props} key={lot._id}>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {material}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Charge: {lot.lotNumber} • {lot.currentQuantity}{" "}
                          {lot.unit} verfügbar
                          {lot.expiryDate &&
                            ` • Ablauf: ${formatDateDE(lot.expiryDate)}`}
                          {isLowStock && (
                            <Chip
                              label="Niedriger Bestand"
                              size="small"
                              color="warning"
                              sx={{ ml: 1, height: 16, fontSize: 10 }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
              />
            )}

            {/* Selected Lots Display */}
            {selectedLotsWithQuantity.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: "rgba(104, 201, 242, 0.1)" }}
                      >
                        <TableCell sx={{ fontWeight: 600, width: 150 }}>
                          Material
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120 }}>
                          Chargennr.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 100 }}>
                          Verfügbar
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 150 }}>
                          Menge verwendet *
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 100 }}>
                          Ablaufdatum
                        </TableCell>
                        {isEditMode && (
                          <TableCell sx={{ width: 50 }}></TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedLotsWithQuantity.map((item) => {
                        const material =
                          typeof item.lot.material === "string"
                            ? item.lot.material
                            : (item.lot.material as InventoryMaterial).name;
                        return (
                          <TableRow key={item.lot._id} hover>
                            <TableCell>{material}</TableCell>
                            <TableCell sx={{ fontFamily: "monospace" }}>
                              {item.lot.lotNumber}
                            </TableCell>
                            <TableCell>
                              {item.lot.currentQuantity} {item.lot.unit}
                            </TableCell>
                            <TableCell>
                              {isEditMode ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={item.quantityUsed || ""}
                                    onChange={(e) => {
                                      const value =
                                        parseFloat(e.target.value) || 0;
                                      setSelectedLotsWithQuantity((prev) =>
                                        prev.map((p) =>
                                          p.lot._id === item.lot._id
                                            ? { ...p, quantityUsed: value }
                                            : p,
                                        ),
                                      );
                                    }}
                                    inputProps={{
                                      min: 0,
                                      max: item.lot.currentQuantity,
                                      step: 0.1,
                                    }}
                                    sx={{ width: 80 }}
                                    error={
                                      item.quantityUsed >
                                      item.lot.currentQuantity
                                    }
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {item.lot.unit}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2">
                                  {item.quantityUsed} {item.lot.unit}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell
                              sx={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {item.lot.expiryDate
                                ? formatDateDE(item.lot.expiryDate)
                                : "-"}
                            </TableCell>
                            {isEditMode && (
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setSelectedLotsWithQuantity((prev) =>
                                      prev.filter(
                                        (l) => l.lot._id !== item.lot._id,
                                      ),
                                    )
                                  }
                                  sx={{ color: "#f44336" }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {selectedLotsWithQuantity.length === 0 && !isEditMode && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Keine Materialien aus dem Inventar verknüpft
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Sections */}
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
          {/* Section Header */}
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

          {/* Items Table */}
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
                    sx={{ fontWeight: 600, width: 70, textAlign: "center" }}
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
                    <TableCell>
                      {isEditMode ? (
                        <TextField
                          value={mengeValues[item.number] || ""}
                          onChange={(e) =>
                            handleMengeChange(item.number, e.target.value)
                          }
                          variant="outlined"
                          size="small"
                          type="number"
                          inputProps={{
                            min: 0,
                            max: 32,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: 60 }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ textAlign: "center", fontWeight: 500 }}
                        >
                          {mengeValues[item.number] ||
                            getDefaultValue(item.defaultValue)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Stack>
  );
};

export default LaborzettelForm;
