// auth/permissions.ts
export type Role = "superadmin" | "doctor" | "nurse" | "staff";

export type Permission =
  | "patients.read"
  | "patients.write"
  | "requests.read"
  | "requests.write"
  | "clinics.read"
  | "clinics.write"
  | "doctors.read"
  | "doctors.write"
  | "nurses.read"
  | "nurses.write"
  | "operations.read"
  | "operations.write"
  | "categories.read"
  | "categories.write"
  | "options.read"
  | "options.write"
  | "materials.read"
  | "materials.write"
  | "users.read"
  | "users.write"
  | "reports.read"
  | "reports.write";

export const rolePerms: Record<Role, Permission[]> = {
  superadmin: ["users.read", "users.write", "clinics.read", "clinics.write", "doctors.read", "doctors.write", "nurses.read", "nurses.write", "operations.read", "operations.write", "categories.read", "categories.write", "options.read", "options.write", "materials.read", "materials.write", "reports.read", "reports.write", "patients.read", "patients.write", "requests.read", "requests.write"],
  doctor: ["patients.read", "patients.write", "requests.read", "requests.write"],
  nurse: ["patients.read", "patients.write", "requests.read", "requests.write"],
  staff: ["patients.read", "patients.write", "requests.read", "requests.write"],
};

export const hasPerm = (
  granted: Permission[],
  need?: Permission | Permission[]
) => {
  if (!need) return true;
  const req = Array.isArray(need) ? need : [need];
  const set = new Set(granted);
  return req.every((p) => set.has(p));
};
