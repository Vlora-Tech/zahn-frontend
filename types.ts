export type OptionsSchema = {
  mode: "multi" | "single" | "all";
  parents: OptionsSchemaParent[];
};

export type OptionsSchemaParent = {
  label: string;
  value: string;
  onlyShowChildrenIfSelected?: boolean;
  children?: OptionsSchemaChild[];
};

export type OptionsSchemaChild =
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
