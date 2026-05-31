export type UserRole = "GEST" | "RCME" | "RMED" | "DIR" | "ADMN";

export type AppUser = {
  id: string;
  login: string;
  nomAffichage: string;
  role: UserRole;
  actif: boolean;
};

export const USER_ROLES: { id: UserRole; label: string }[] = [
  { id: "GEST", label: "Gestionnaire APRS" },
  { id: "RCME", label: "Référent conseil médical" },
  { id: "RMED", label: "Référent médecine du travail" },
  { id: "DIR", label: "Direction (lecture seule)" },
  { id: "ADMN", label: "Administrateur" },
];

export const ROLE_TONE: Record<UserRole, "info" | "success" | "warning" | "neutral" | "error"> = {
  GEST: "info",
  RCME: "success",
  RMED: "warning",
  DIR: "neutral",
  ADMN: "error",
};

export function getRoleLabel(role: UserRole): string {
  return USER_ROLES.find((entry) => entry.id === role)?.label ?? role;
}

export const INITIAL_USERS: AppUser[] = [
  {
    id: "usr-admin-001",
    login: "admin",
    nomAffichage: "Administrateur applicatif",
    role: "ADMN",
    actif: true,
  },
  {
    id: "usr-mdupont-002",
    login: "mdupont",
    nomAffichage: "Marie Dupont",
    role: "GEST",
    actif: true,
  },
  {
    id: "usr-jbernard-003",
    login: "jbernard",
    nomAffichage: "Jean Bernard",
    role: "RCME",
    actif: true,
  },
  {
    id: "usr-lpetit-004",
    login: "lpetit",
    nomAffichage: "Luc Petit",
    role: "RMED",
    actif: true,
  },
  {
    id: "usr-direction-005",
    login: "direction",
    nomAffichage: "Direction CHUM",
    role: "DIR",
    actif: true,
  },
  {
    id: "usr-cmartin-006",
    login: "cmartin",
    nomAffichage: "Claire Martin",
    role: "DIR",
    actif: true,
  },
];

export type UserFormValues = {
  login: string;
  nomAffichage: string;
  role: UserRole;
  motDePasse: string;
  confirmation: string;
  actif: boolean;
};

export function emptyUserForm(): UserFormValues {
  return {
    login: "",
    nomAffichage: "",
    role: "GEST",
    motDePasse: "",
    confirmation: "",
    actif: true,
  };
}

export function userToFormValues(user: AppUser): UserFormValues {
  return {
    login: user.login,
    nomAffichage: user.nomAffichage,
    role: user.role,
    motDePasse: "",
    confirmation: "",
    actif: user.actif,
  };
}

const LOGIN_PATTERN = /^[a-z][a-z0-9._-]{2,31}$/;

export function validateUserForm(
  values: UserFormValues,
  options: { mode: "create" | "edit"; existingLogins: string[] },
): string | null {
  const login = values.login.trim().toLowerCase();

  if (!login) return "Le login est obligatoire.";
  if (!LOGIN_PATTERN.test(login)) {
    return "Login invalide (3–32 caractères, lettres minuscules, chiffres, . _ -).";
  }
  if (options.mode === "create" && options.existingLogins.includes(login)) {
    return "Ce login existe déjà.";
  }

  if (!values.nomAffichage.trim()) return "Le nom affiché est obligatoire.";

  if (options.mode === "create" || values.motDePasse || values.confirmation) {
    if (values.motDePasse.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (values.motDePasse !== values.confirmation) {
      return "Les mots de passe ne correspondent pas.";
    }
  }

  return null;
}

export type ProfileFormValues = {
  nomAffichage: string;
  motDePasse: string;
  confirmation: string;
};

export function profileToFormValues(user: AppUser): ProfileFormValues {
  return {
    nomAffichage: user.nomAffichage,
    motDePasse: "",
    confirmation: "",
  };
}

export function validateProfileForm(values: ProfileFormValues): string | null {
  if (!values.nomAffichage.trim()) return "Le nom affiché est obligatoire.";

  if (values.motDePasse || values.confirmation) {
    if (values.motDePasse.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (values.motDePasse !== values.confirmation) {
      return "Les mots de passe ne correspondent pas.";
    }
  }

  return null;
}

/** Compte protégé contre la suppression (prototype). */
export const PROTECTED_LOGIN = "admin";
