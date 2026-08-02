import i18n from "../i18n";

const API_URL = import.meta.env.VITE_API_URL;

export async function api(endpoint: string, options: RequestInit = {}) {
  // JWT token
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const errorCode = data.code || "SOMETHING_WENT_WRONG";
    const translated = i18n.t(`errors.${errorCode}`);
    throw new Error(translated);
  }

  return data;
}
