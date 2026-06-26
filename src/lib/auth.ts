export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "Administrador" | "Usuario";
  status: "ACTIVO";
  createdAt: string;
  lastAccess: string;
};

const USERS_KEY = "rss-dashboard-users";
const SESSION_KEY = "rss-dashboard-session";

const defaultAdmin: DashboardUser = {
  id: "USR-001",
  name: "Administrador RSS",
  email: "admin@roatanselfstorage.com",
  password: "Admin123!",
  role: "Administrador",
  status: "ACTIVO",
  createdAt: "2026-05-01T08:00:00-06:00",
  lastAccess: "2026-06-02T08:00:00-06:00",
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getUsers(): DashboardUser[] {
  if (!canUseStorage()) return [defaultAdmin];

  const savedUsers = window.localStorage.getItem(USERS_KEY);
  if (!savedUsers) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }

  try {
    return JSON.parse(savedUsers) as DashboardUser[];
  } catch {
    window.localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
}

function saveUsers(users: DashboardUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail && item.password === password);

  if (!user) return null;

  const updatedUser = { ...user, lastAccess: new Date().toISOString() };
  saveUsers(users.map((item) => (item.id === user.id ? updatedUser : item)));
  window.localStorage.setItem(SESSION_KEY, updatedUser.id);
  return updatedUser;
}

export function logout() {
  if (canUseStorage()) window.localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  if (!canUseStorage()) return null;
  const sessionId = window.localStorage.getItem(SESSION_KEY);
  return getUsers().find((user) => user.id === sessionId) ?? null;
}

export function inviteUser(name: string, email: string, password: string) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, message: "Ya existe un usuario registrado con ese correo." };
  }

  const user: DashboardUser = {
    id: `USR-${String(users.length + 1).padStart(3, "0")}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "Usuario",
    status: "ACTIVO",
    createdAt: new Date().toISOString(),
    lastAccess: "Pendiente de primer acceso",
  };

  saveUsers([...users, user]);
  return { ok: true, message: `Usuario ${normalizedEmail} invitado correctamente.`, user };
}

export function changePassword(userId: string, currentPassword: string, nextPassword: string) {
  const users = getUsers();
  const user = users.find((item) => item.id === userId);

  if (!user || user.password !== currentPassword) {
    return { ok: false, message: "La contraseña actual no es correcta." };
  }

  saveUsers(users.map((item) => (item.id === userId ? { ...item, password: nextPassword } : item)));
  return { ok: true, message: "Contraseña actualizada correctamente." };
}
