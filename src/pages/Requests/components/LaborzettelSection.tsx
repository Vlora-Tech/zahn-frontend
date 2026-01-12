import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { Print, Assignment } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useLaborzettelByLabRequest } from "../../../api/laborzettel/hooks";
import { useLabRequestByRequestId } from "../../../api/lab-requests/hooks";
import ButtonBlock from "../../../components/atoms/ButtonBlock";

interface LaborzettelSectionProps {
  requestId: string;
}

const LaborzettelSection: React.FC<LaborzettelSectionProps> = ({
  requestId,
}) => {
  const { data: labRequest, isLoading: isLoadingLabRequest } =
    useLabRequestByRequestId(requestId);
  const { data: laborzettel, isLoading: isLoadingLaborzettel } =
    useLaborzettelByLabRequest(labRequest?._id || "");

  const isLoading = isLoadingLabRequest || isLoadingLaborzettel;

  const handlePrint = () => {
    if (!labRequest || !laborzettel) return;

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
    doc.text("Laborzettel", pageWidth / 2, yPos, { align: "center" });
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
    doc.text(`Lot Nr.: ${laborzettel.lotNr}`, 20, yPos);
    yPos += 10;

    // Sections with items
    laborzettel.sections.forEach((section) => {
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
        item.menge,
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
    const fileName = `Laborzettel_${request?.requestNumber || "unknown"}_${laborzettel.lotNr}.pdf`;
    doc.save(fileName);
  };

  if (isLoading) {
    return (
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          p: 3,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" py={3}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Laborzettel wird geladen...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Don't show anything if no laborzettel exists
  if (!laborzettel) {
    return null;
  }

  return (
    <Paper
      sx={{
        borderRadius: "12px",
        background: "white",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background:
            "linear-gradient(90deg, rgba(92, 107, 192, 0.1) 0%, rgba(121, 134, 203, 0.1) 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Assignment sx={{ fontSize: 20, color: "#5C6BC0" }} />
          <Box>
            {laborzettel.laborzettelNumber && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  color: "#5C6BC0",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {laborzettel.laborzettelNumber}
              </Typography>
            )}
          </Box>
        </Box>
        <ButtonBlock
          onClick={handlePrint}
          startIcon={<Print />}
          style={{
            borderRadius: "6px",
            height: "32px",
            color: "white",
            background: "linear-gradient(90deg, #5C6BC0 0%, #7986CB 100%)",
            fontSize: "12px",
            fontWeight: "600",
            padding: "0 16px",
            width: "auto",
          }}
        >
          PDF drucken
        </ButtonBlock>
      </Box>

      {/* Lot Nr. */}
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(107, 107, 107, 1)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Lot Nr.
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, fontFamily: "monospace" }}
        >
          {laborzettel.lotNr}
        </Typography>
      </Box>

      {/* Sections */}
      {laborzettel.sections.map((section) => (
        <Box key={section.section}>
          {/* Section Header */}
          <Box
            sx={{
              px: 2,
              py: 1,
              background: "rgba(0,0,0,0.02)",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: "12px" }}
            >
              {section.section}
            </Typography>
          </Box>

          {/* Items Table */}
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      width: 70,
                      minWidth: 70,
                      fontSize: "11px",
                      py: 0.5,
                    }}
                  >
                    L-Nr.
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "11px",
                      py: 0.5,
                      minWidth: 260,
                    }}
                  >
                    Leistung
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      width: 70,
                      minWidth: 70,
                      fontSize: "11px",
                      py: 0.5,
                      textAlign: "center",
                    }}
                  >
                    Menge
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.number}>
                    <TableCell
                      sx={{
                        fontFamily: "monospace",
                        color: "rgba(107, 107, 107, 1)",
                        fontSize: "11px",
                        py: 0.5,
                      }}
                    >
                      {item.number}
                    </TableCell>
                    <TableCell sx={{ fontSize: "11px", py: 0.5 }}>
                      {item.name}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 500,
                        fontSize: "11px",
                        py: 0.5,
                      }}
                    >
                      {item.menge}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

export default LaborzettelSection;
