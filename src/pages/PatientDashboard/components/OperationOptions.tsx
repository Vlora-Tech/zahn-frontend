import {
  Box,
  Stack,
  Typography,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField as MUITextField,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import {
  OptionsSchema,
  OptionsSchemaChild,
  OptionsSchemaParent,
} from "../../../api/operations/types";
import { DrawingPad } from "../../../components/DrawingPad";
import { FC, useEffect, useMemo } from "react";

const DRAWING_SUFFIX = "__drawing";

const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const parentSlug = (p: OptionsSchemaParent) => slug(p.label);

export function ensureStateForSchema(
  schema: OptionsSchema,
  value: Record<string, any>
) {
  const next = { ...value };
  if (schema.mode === "multi") {
    next.__selected = { ...(next.__selected || {}) };

    for (const p of schema.parents) {
      const ps = parentSlug(p);
      if (typeof next.__selected[ps] !== "boolean") next.__selected[ps] = false;
    }
  }

  if (schema.mode === "single") {
    if (typeof next.__selectedParent !== "string") next.__selectedParent = "";
  }

  return next;
}

export function toFlatOutput(
  schema: OptionsSchema,
  value: Record<string, any>
) {
  const keyToHuman: Record<string, string> = {};

  const fieldToParent: Record<string, string> = {};

  const parentSlugs = new Set(schema.parents.map(parentSlug));

  for (const p of schema.parents) {
    const pSlug = parentSlug(p);

    keyToHuman[pSlug] = p.label;

    for (const ch of p.children ?? []) {
      if (ch.type === "text") {
        const k = slug(ch.label);

        keyToHuman[k] = ch.label;

        fieldToParent[k] = pSlug;
      } else if (ch.type === "select") {
        const k = ch.label ? slug(ch.label) : pSlug; // unlabeled -> parent

        keyToHuman[k] = ch.label ?? p.label;

        fieldToParent[k] = pSlug;
      } else if (ch.type === "multi-select") {
        const k = slug(ch.label);

        keyToHuman[k] = ch.label;

        fieldToParent[k] = pSlug;
      } else if (ch.type === "drawing") {
        const human = ch.label ? ch.label : `${p.label}${DRAWING_SUFFIX}`;

        const k = slug(human);

        keyToHuman[k] = human;

        fieldToParent[k] = pSlug;
      } else if (ch.type === "file-upload") {
        const k = slug(ch.label);

        keyToHuman[k] = ch.label;

        fieldToParent[k] = pSlug;
      }
    }
  }

  const activeParents = new Set<string>();

  if (schema.mode === "all") {
    parentSlugs.forEach((ps) => activeParents.add(ps));
  } else if (schema.mode === "multi") {
    const sel = value.__selected || {};

    for (const ps of parentSlugs) if (sel[ps]) activeParents.add(ps);
  } else if (schema.mode === "single") {
    if (value.__selectedParent) activeParents.add(value.__selectedParent);
  }

  const out: Record<string, any> = {};

  const files: Record<string, File[]> = {};

  for (const [key, human] of Object.entries(keyToHuman)) {
    const ps = fieldToParent[key];

    if (!ps || !activeParents.has(ps)) continue;

    const val = value[key];
    if (
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim() === "") ||
      (Array.isArray(val) && val.length === 0)
    ) {
      continue;
    }

    if (Array.isArray(val) && val.length && val[0] instanceof File) {
      out[human] = (val as File[]).map((f) => f.name);

      files[human] = val as File[];
    } else {
      out[human] = val;
    }
  }

  return { json: out, files };
}

type OperationOptionsProps = {
  schema: OptionsSchema;
  selectedOperationOptions: Record<string, any>;
  handleDefineOptionsParameters: (next: Record<string, any>) => void;
};

const OperationOptions: FC<OperationOptionsProps> = ({
  schema,
  selectedOperationOptions,
  handleDefineOptionsParameters,
}) => {
  const value = useMemo(
    () => ensureStateForSchema(schema, selectedOperationOptions || {}),

    [schema, selectedOperationOptions]
  );

  useEffect(() => {
    if (value !== selectedOperationOptions) {
      handleDefineOptionsParameters(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setKV = (key: string, v: any) =>
    handleDefineOptionsParameters({ ...value, [key]: v });

  const setSelectedMulti = (pSlug: string, checked: boolean) => {
    handleDefineOptionsParameters({
      ...value,
      __selected: { ...(value.__selected || {}), [pSlug]: checked },
    });
  };

  const setSelectedSingle = (pSlug: string) => {
    handleDefineOptionsParameters({ ...value, __selectedParent: pSlug });
  };

  const renderChild = (p: OptionsSchemaParent, ch: OptionsSchemaChild) => {
    const ps = parentSlug(p);

    if (ch.type === "text") {
      const key = slug(ch.label);

      const val = value[key] ?? "";

      return (
        <MUITextField
          key={key}
          label={ch.label}
          value={val}
          onChange={(e) => setKV(key, e.target.value)}
          fullWidth
        />
      );
    }

    if (ch.type === "select") {
      const key = ch.label ? slug(ch.label) : ps; // unlabeled -> parent

      const val = value[key] ?? "";

      return (
        <FormControl fullWidth key={key}>
          {ch.label ? (
            <InputLabel id={`${key}-lbl`}>{ch.label}</InputLabel>
          ) : null}
          <Select
            labelId={ch.label ? `${key}-lbl` : undefined}
            value={val}
            label={ch.label}
            onChange={(e) => setKV(key, e.target.value)}
          >
            {ch.options.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (ch.type === "multi-select") {
      const key = slug(ch.label);

      const val: string[] = value[key] ?? [];

      return (
        <FormControl fullWidth key={key}>
          <InputLabel id={`${key}-lbl`}>{ch.label}</InputLabel>
          <Select
            multiple
            labelId={`${key}-lbl`}
            value={val}
            label={ch.label}
            onChange={(e) => setKV(key, e.target.value as string[])}
            renderValue={(selected) => (
              <Stack direction="row" gap={0.5} flexWrap="wrap">
                {(selected as string[]).map((s) => (
                  <Chip key={s} label={s} size="small" />
                ))}
              </Stack>
            )}
          >
            {ch.options.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (ch.type === "drawing") {
      const human = ch.label ? ch.label : `${p.label}${DRAWING_SUFFIX}`;

      const key = slug(human);

      const val = value[key] ?? "";

      return (
        <Box key={key}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {human}
          </Typography>
          <DrawingPad
            value={val}
            onChange={(dataUrl) => setKV(key, dataUrl)}
            width={360}
            height={220}
            strokeWidth={2}
          />
        </Box>
      );
    }

    return null;
  };

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
        {"Optionen und Parameters"}
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
        }}
      >
        {schema.mode === "single" ? (
          <RadioGroup
            sx={{ width: "100%" }}
            value={value.__selectedParent || ""}
            onChange={(_, v) => setSelectedSingle(v)}
          >
            {schema.parents.map((p, idx) => {
              const ps = parentSlug(p);

              const isActive = value.__selectedParent === ps;

              return (
                <Box
                  key={ps}
                  sx={{ mb: idx < schema.parents.length - 1 ? 2 : 0 }}
                >
                  <FormControlLabel
                    value={ps}
                    control={<Radio />}
                    label={p.label}
                  />
                  {isActive && (p.children?.length ?? 0) > 0 && (
                    <Stack gap={2} sx={{ ml: 4, mt: 1 }}>
                      {p.children!.map((ch) => renderChild(p, ch))}
                    </Stack>
                  )}
                  {idx < schema.parents.length - 1 ? (
                    <Divider sx={{ mt: 2 }} />
                  ) : null}
                </Box>
              );
            })}
          </RadioGroup>
        ) : schema.mode === "multi" ? (
          <Stack gap={2}>
            {schema.parents.map((p, idx) => {
              const ps = parentSlug(p);

              const checked = !!value.__selected?.[ps];

              const showChildren = checked || !p.onlyShowChildrenIfSelected;

              return (
                <Box key={ps}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) => setSelectedMulti(ps, e.target.checked)}
                      />
                    }
                    label={p.label}
                  />
                  {showChildren && (p.children?.length ?? 0) > 0 && (
                    <Stack gap={2} sx={{ ml: 4, mt: 1 }}>
                      {p.children!.map((ch) => renderChild(p, ch))}
                    </Stack>
                  )}
                  {idx < schema.parents.length - 1 ? (
                    <Divider sx={{ mt: 2 }} />
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Stack sx={{ width: "100%" }} gap={2}>
            {schema.parents.map((p, idx) => (
              <Box sx={{ width: "100%" }} key={parentSlug(p)}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {p.label}
                </Typography>
                {(p.children?.length ?? 0) > 0 && (
                  <Stack gap={2} sx={{ ml: 4, mt: 1 }}>
                    {p.children!.map((ch) => renderChild(p, ch))}
                  </Stack>
                )}
                {idx < schema.parents.length - 1 ? (
                  <Divider sx={{ mt: 2 }} />
                ) : null}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};

export default OperationOptions;
