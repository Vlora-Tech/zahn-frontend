import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  Stack,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import {
  Add,
  Delete,
  DragIndicator,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Procedure } from "../../../api/procedures/types";
import {
  ProcedureSectionDto,
  ProcedureItemDto,
} from "../../../api/laborzettel-templates/types";
import ButtonBlock from "../../../components/atoms/ButtonBlock";
import AsyncProcedureSelect from "../../../components/atoms/AsyncProcedureSelect";

interface SectionEditorProps {
  sections: ProcedureSectionDto[];
  onChange: (sections: ProcedureSectionDto[]) => void;
  error?: string;
}

interface SortableSectionProps {
  section: ProcedureSectionDto;
  index: number;
  onUpdate: (index: number, section: ProcedureSectionDto) => void;
  onDelete: (index: number) => void;
  proceduresMap: Map<string, Procedure>;
  onProcedureSelect: (procedure: Procedure) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// Default value options for procedures
const defaultValueOptions = [
  { label: "1", value: "1" },
  { label: "Anzahl Zähne", value: "teethCount" },
];

// Sortable Section Item Component
const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  index,
  onUpdate,
  onDelete,
  proceduresMap,
  onProcedureSelect,
  isExpanded,
  onToggleExpand,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleHeaderChange = (value: string) => {
    onUpdate(index, { ...section, sectionHeader: value });
  };

  const handleProceduresChange = (newProcedures: ProcedureItemDto[]) => {
    onUpdate(index, { ...section, procedures: newProcedures });
  };

  const handleAddProcedure = () => {
    const newProcedures = [
      ...section.procedures,
      { procedure: "", defaultValue: "1" },
    ];
    handleProceduresChange(newProcedures);
  };

  const handleUpdateProcedure = (
    procIndex: number,
    field: keyof ProcedureItemDto,
    value: string,
  ) => {
    const newProcedures = [...section.procedures];
    newProcedures[procIndex] = { ...newProcedures[procIndex], [field]: value };
    handleProceduresChange(newProcedures);
  };

  const handleDeleteProcedure = (procIndex: number) => {
    const newProcedures = section.procedures.filter((_, i) => i !== procIndex);
    handleProceduresChange(newProcedures);
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: isExpanded ? 2 : 0,
        }}
      >
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{ cursor: "grab", color: "rgba(146, 146, 146, 1)" }}
        >
          <DragIndicator />
        </IconButton>
        <TextField
          size="small"
          placeholder="Abschnittsname"
          value={section.sectionHeader}
          onChange={(e) => handleHeaderChange(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Chip
          label={`${section.procedures.length} Leistungen`}
          size="small"
          sx={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
        />
        <IconButton size="small" onClick={onToggleExpand}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(index)}
          sx={{ color: "#d32f2f" }}
        >
          <Delete />
        </IconButton>
      </Box>

      {/* Procedures List (Collapsible) */}
      {isExpanded && (
        <Box sx={{ pl: 5 }}>
          <Stack spacing={1.5}>
            {section.procedures.map((proc, procIndex) => (
              <Box
                key={procIndex}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  backgroundColor: "#fafafa",
                  p: 1,
                  borderRadius: "4px",
                }}
              >
                <Box sx={{ flex: 2 }}>
                  <AsyncProcedureSelect
                    size="small"
                    value={proceduresMap.get(proc.procedure) || null}
                    onChange={(newValue) => {
                      handleUpdateProcedure(
                        procIndex,
                        "procedure",
                        newValue?._id || "",
                      );
                      if (newValue) {
                        onProcedureSelect(newValue);
                      }
                    }}
                    placeholder="Leistung auswählen"
                  />
                </Box>
                <Autocomplete
                  size="small"
                  freeSolo
                  options={defaultValueOptions}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  value={
                    defaultValueOptions.find(
                      (opt) => opt.value === proc.defaultValue,
                    ) || proc.defaultValue
                  }
                  onChange={(_, newValue) => {
                    const value =
                      typeof newValue === "string"
                        ? newValue
                        : newValue?.value || "1";
                    handleUpdateProcedure(procIndex, "defaultValue", value);
                  }}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === "input") {
                      handleUpdateProcedure(
                        procIndex,
                        "defaultValue",
                        newInputValue,
                      );
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Standardwert" />
                  )}
                  sx={{ flex: 1, minWidth: 150 }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteProcedure(procIndex)}
                  sx={{ color: "#d32f2f" }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
          <ButtonBlock
            startIcon={<Add />}
            onClick={handleAddProcedure}
            sx={{
              mt: 1.5,
              color: "#1976d2",
              textTransform: "none",
              fontSize: "13px",
            }}
          >
            Leistung hinzufügen
          </ButtonBlock>
        </Box>
      )}
    </Paper>
  );
};

// Main Section Editor Component
const SectionEditor: React.FC<SectionEditorProps> = ({
  sections,
  onChange,
  error,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(sections.map((_, i) => i)),
  );
  const [proceduresMap, setProceduresMap] = useState<Map<string, Procedure>>(
    new Map(),
  );

  // Function to add a procedure to the map (called when AsyncProcedureSelect selects a procedure)
  const addProcedureToMap = React.useCallback((procedure: Procedure) => {
    setProceduresMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(procedure._id, procedure);
      return newMap;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(String(active.id).replace("section-", ""));
      const newIndex = parseInt(String(over.id).replace("section-", ""));

      const newSections = arrayMove(sections, oldIndex, newIndex).map(
        (section, index) => ({
          ...section,
          displayOrder: index,
        }),
      );

      onChange(newSections);

      // Update expanded sections indices
      const newExpanded = new Set<number>();
      expandedSections.forEach((idx) => {
        if (idx === oldIndex) {
          newExpanded.add(newIndex);
        } else if (idx > oldIndex && idx <= newIndex) {
          newExpanded.add(idx - 1);
        } else if (idx < oldIndex && idx >= newIndex) {
          newExpanded.add(idx + 1);
        } else {
          newExpanded.add(idx);
        }
      });
      setExpandedSections(newExpanded);
    }
  };

  const handleAddSection = () => {
    const newSection: ProcedureSectionDto = {
      sectionHeader: "",
      procedures: [],
      displayOrder: sections.length,
    };
    onChange([...sections, newSection]);
    setExpandedSections(new Set([...expandedSections, sections.length]));
  };

  const handleUpdateSection = (index: number, section: ProcedureSectionDto) => {
    const newSections = [...sections];
    newSections[index] = section;
    onChange(newSections);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = sections
      .filter((_, i) => i !== index)
      .map((section, i) => ({ ...section, displayOrder: i }));
    onChange(newSections);

    // Update expanded sections
    const newExpanded = new Set<number>();
    expandedSections.forEach((idx) => {
      if (idx < index) {
        newExpanded.add(idx);
      } else if (idx > index) {
        newExpanded.add(idx - 1);
      }
    });
    setExpandedSections(newExpanded);
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((_, i) => `section-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, index) => (
            <SortableSection
              key={`section-${index}`}
              section={section}
              index={index}
              onUpdate={handleUpdateSection}
              onDelete={handleDeleteSection}
              proceduresMap={proceduresMap}
              onProcedureSelect={addProcedureToMap}
              isExpanded={expandedSections.has(index)}
              onToggleExpand={() => toggleExpand(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <ButtonBlock
        startIcon={<Add />}
        onClick={handleAddSection}
        sx={{
          borderRadius: "40px",
          textTransform: "none",
          background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
          color: "white",
          px: 2,
          fontWeight: "500",
          fontSize: "14px",
          height: "37px",
        }}
      >
        Abschnitt hinzufügen
      </ButtonBlock>

      {sections.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          Keine Abschnitte vorhanden. Fügen Sie einen Abschnitt hinzu.
        </Typography>
      )}
    </Box>
  );
};

export default SectionEditor;
