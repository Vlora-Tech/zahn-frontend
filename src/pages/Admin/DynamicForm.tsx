import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

type ChildField =
  | { type: "text"; label?: string }
  | {
      type: "select";
      label?: string;
      options: { label: string; value: string }[];
    }
  | {
      type: "multi-select";
      label?: string;
      options: { label: string; value: string }[];
    }
  | { type: "drawing"; label?: string }
  | {
      type: "file-upload";
      label?: string;
      accept?: string[];
      maxFiles?: number;
    };

type Parent = {
  label: string;
  value: string;
  onlyShowChildrenIfSelected?: boolean;
  children?: ChildField[];
};

export type Schema = {
  mode: "multi" | "single" | "all";
  parents: Parent[];
};

interface DynamicFormCreatorProps {
  value: Schema;
  onChange: (schema: Schema) => void;
}

const DynamicFormCreator: React.FC<DynamicFormCreatorProps> = ({
  value,
  onChange,
}) => {
  const handleModeChange = (mode: Schema["mode"]) => {
    onChange({ ...value, mode });
  };

  const handleAddParent = () => {
    const newParent: Parent = {
      label: "New Parent",
      value: "new-parent",
      onlyShowChildrenIfSelected: true,
      children: [],
    };

    onChange({ ...value, parents: [...(value.parents ?? []), newParent] });
  };

  const handleRemoveParent = (idx: number) => {
    const parents = [...value.parents];

    parents.splice(idx, 1);

    onChange({ ...value, parents });
  };

  const handleParentChange = (idx: number, key: keyof Parent, val: any) => {
    const parents = [...value.parents];

    (parents[idx] as any)[key] = val;

    onChange({ ...value, parents });
  };

  const handleAddChild = (parentIdx: number, type: ChildField["type"]) => {
    const parents = [...value.parents];

    let child: ChildField;

    switch (type) {
      case "text":
        child = { type: "text", label: "Text Field" };

        break;
      case "select":
        child = { type: "select", label: "Select Field", options: [] };

        break;
      case "multi-select":
        child = {
          type: "multi-select",
          label: "Multi-Select Field",
          options: [],
        };

        break;
      case "drawing":
        child = { type: "drawing", label: "Drawing" };

        break;
      case "file-upload":
        child = {
          type: "file-upload",
          label: "File Upload",
          accept: [".jpg", ".png"],
          maxFiles: 1,
        };

        break;
      default:
        return;
    }

    parents[parentIdx].children = parents[parentIdx].children || [];

    parents[parentIdx].children!.push(child);

    onChange({ ...value, parents });
  };

  const handleRemoveChild = (parentIdx: number, childIdx: number) => {
    const parents = [...value.parents];

    parents[parentIdx].children!.splice(childIdx, 1);

    onChange({ ...value, parents });
  };

  const handleChildChange = (
    parentIdx: number,
    childIdx: number,
    key: string,
    val: any
  ) => {
    const parents = [...value.parents];

    (parents[parentIdx].children![childIdx] as any)[key] = val;

    onChange({ ...value, parents });
  };

  const handleAddChildOption = (parentIdx: number, childIdx: number) => {
    const parents = [...value.parents];

    const child = parents[parentIdx].children![childIdx] as any;

    if (child.options) {
      child.options.push({ label: "New Option", value: "new-option" });
    }

    onChange({ ...value, parents });
  };

  const handleChangeChildOption = (
    parentIdx: number,
    childIdx: number,
    optIdx: number,
    key: "label" | "value",
    val: string
  ) => {
    const parents = [...value.parents];

    const child = parents[parentIdx].children![childIdx] as any;

    if (child.options) {
      child.options[optIdx][key] = val;
    }

    onChange({ ...value, parents });
  };

  return (
    <Stack spacing={2}>
      <FormControl>
        <InputLabel>Mode</InputLabel>
        <Select
          value={value.mode}
          onChange={(e) => handleModeChange(e.target.value as Schema["mode"])}
          label="Mode"
          sx={{ width: 200 }}
        >
          <MenuItem value="multi">Multiple Selection</MenuItem>
          <MenuItem value="single">Single Selection</MenuItem>
          <MenuItem value="all">All Required</MenuItem>
        </Select>
      </FormControl>
      {value?.parents?.map((parent, parentIdx) => (
        <Card key={parentIdx} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Parent Label"
                  value={parent.label}
                  onChange={(e) =>
                    handleParentChange(parentIdx, "label", e.target.value)
                  }
                />
                <TextField
                  label="Value"
                  value={parent.value}
                  onChange={(e) =>
                    handleParentChange(parentIdx, "value", e.target.value)
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={parent.onlyShowChildrenIfSelected || false}
                      onChange={(e) =>
                        handleParentChange(
                          parentIdx,
                          "onlyShowChildrenIfSelected",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Show children only if selected"
                />
                <IconButton onClick={() => handleRemoveParent(parentIdx)}>
                  <Delete />
                </IconButton>
              </Stack>
              <Stack spacing={2}>
                <Typography variant="subtitle2">Children</Typography>
                {parent.children?.map((child, childIdx) => (
                  <Box
                    key={childIdx}
                    sx={{
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <FormControl>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={child.type}
                          onChange={(e) =>
                            handleChildChange(
                              parentIdx,
                              childIdx,
                              "type",
                              e.target.value
                            )
                          }
                          sx={{ minWidth: 160 }}
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="select">Select</MenuItem>
                          <MenuItem value="multi-select">Multi-Select</MenuItem>
                          <MenuItem value="drawing">Drawing</MenuItem>
                          <MenuItem value="file-upload">File Upload</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Label"
                        value={(child as any).label || ""}
                        onChange={(e) =>
                          handleChildChange(
                            parentIdx,
                            childIdx,
                            "label",
                            e.target.value
                          )
                        }
                      />
                      <IconButton
                        onClick={() => handleRemoveChild(parentIdx, childIdx)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                    {(child.type === "select" ||
                      child.type === "multi-select") && (
                      <Stack spacing={3} sx={{ mt: 3 }}>
                        {(child as any).options.map(
                          (o: any, optIdx: number) => (
                            <Stack direction="row" spacing={2} key={optIdx}>
                              <TextField
                                label="Option Label"
                                value={o.label}
                                onChange={(e) =>
                                  handleChangeChildOption(
                                    parentIdx,
                                    childIdx,
                                    optIdx,
                                    "label",
                                    e.target.value
                                  )
                                }
                              />
                              <TextField
                                label="Option Value"
                                value={o.value}
                                onChange={(e) =>
                                  handleChangeChildOption(
                                    parentIdx,
                                    childIdx,
                                    optIdx,
                                    "value",
                                    e.target.value
                                  )
                                }
                              />
                            </Stack>
                          )
                        )}
                        <Button
                          onClick={() =>
                            handleAddChildOption(parentIdx, childIdx)
                          }
                        >
                          Add Option
                        </Button>
                      </Stack>
                    )}
                    {child.type === "file-upload" && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField
                          label="Accepted Types (comma separated)"
                          value={(child as any).accept?.join(",") || ""}
                          onChange={(e) =>
                            handleChildChange(
                              parentIdx,
                              childIdx,
                              "accept",
                              e.target.value.split(",")
                            )
                          }
                        />
                        <TextField
                          type="number"
                          label="Max Files"
                          value={(child as any).maxFiles || 1}
                          onChange={(e) =>
                            handleChildChange(
                              parentIdx,
                              childIdx,
                              "maxFiles",
                              parseInt(e.target.value, 10)
                            )
                          }
                        />
                      </Stack>
                    )}
                  </Box>
                ))}
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => handleAddChild(parentIdx, "text")}>
                    Add Text
                  </Button>
                  <Button onClick={() => handleAddChild(parentIdx, "select")}>
                    Add Select
                  </Button>
                  <Button
                    onClick={() => handleAddChild(parentIdx, "multi-select")}
                  >
                    Add Multi-Select
                  </Button>
                  <Button onClick={() => handleAddChild(parentIdx, "drawing")}>
                    Add Drawing
                  </Button>
                  <Button
                    onClick={() => handleAddChild(parentIdx, "file-upload")}
                  >
                    Add File Upload
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleAddParent} startIcon={<Add />}>
        Add Parent
      </Button>
    </Stack>
  );
};

export default DynamicFormCreator;
