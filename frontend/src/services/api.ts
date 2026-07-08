import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  me: () => api.get("/api/auth/me"),
  registerLaureat: (payload: object) => api.post("/api/auth/register/laureat", payload),
  registerEntreprise: (payload: object) => api.post("/api/auth/register/entreprise", payload),
};

export const entreprisesApi = {
  me: () => api.get("/api/entreprises/me"),
  updateMe: (payload: object) => api.patch("/api/entreprises/me", payload),
  list: (params?: object) => api.get("/api/entreprises/", { params }),
  valider: (id: number) => api.patch(`/api/entreprises/${id}/valider`),
  rejeter: (id: number) => api.patch(`/api/entreprises/${id}/rejeter`),
};

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const documentsApi = {
  upload: (type: string, file: File) => {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    return api.post("/api/documents/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  me: () => api.get("/api/documents/me"),
  download: async (id: number, filename: string) => {
    const res = await api.get(`/api/documents/${id}/download`, { responseType: "blob" });
    triggerBlobDownload(res.data, filename);
  },
};

export const candidaturesApi = {
  postuler: (id_offre: string) => api.post("/api/candidatures/", { id_offre }),
  mine: () => api.get("/api/candidatures/me"),
  forOffre: (id_offre: string, params?: object) =>
    api.get(`/api/candidatures/offre/${id_offre}`, { params }),
  statsForOffre: (id_offre: string) => api.get(`/api/candidatures/offre/${id_offre}/stats`),
  updateStatut: (id: number, statut: string) =>
    api.patch(`/api/candidatures/${id}/statut`, { statut }),
};

export const exportApi = {
  laureats: async () => {
    const res = await api.get("/api/export/laureats.csv", { responseType: "blob" });
    triggerBlobDownload(res.data, "laureats.csv");
  },
  offres: async () => {
    const res = await api.get("/api/export/offres.csv", { responseType: "blob" });
    triggerBlobDownload(res.data, "offres.csv");
  },
  matchingOffre: async (id_offre: string) => {
    const res = await api.get(`/api/export/matching/offre/${id_offre}.csv`, { responseType: "blob" });
    triggerBlobDownload(res.data, `matching_${id_offre}.csv`);
  },
};

export const filieresApi = {
  list: (params?: object) => api.get("/api/filieres/", { params }),
  get: (id: string) => api.get(`/api/filieres/${id}`),
};

export const competencesApi = {
  list: (params?: object) => api.get("/api/competences/", { params }),
};

export const laureatsApi = {
  list: (params?: object) => api.get("/api/laureats/", { params }),
  get: (id: string) => api.get(`/api/laureats/${id}`),
  me: () => api.get("/api/laureats/me"),
  updateMe: (payload: object) => api.patch("/api/laureats/me", payload),
  updateCompetences: (competences_techniques: string[], soft_skills: string[]) =>
    api.post("/api/laureats/me/competences", { competences_techniques, soft_skills }),
};

export const offresApi = {
  list: (params?: object) => api.get("/api/offres/", { params }),
  get: (id: string) => api.get(`/api/offres/${id}`),
  mine: () => api.get("/api/offres/mine"),
  create: (payload: object) => api.post("/api/offres/", payload),
  createAsAdmin: (payload: object) => api.post("/api/offres/admin", payload),
  update: (id_offre: string, payload: object) => api.patch(`/api/offres/${id_offre}`, payload),
};

export const matchingApi = {
  run: (payload?: object) => api.post("/api/matching/run", payload || {}),
  results: (params?: object) => api.get("/api/matching/results", { params }),
  forLaureat: (id: string) => api.get(`/api/matching/laureat/${id}`),
  forOffre: (id: string) => api.get(`/api/matching/offre/${id}`),
  topOffres: (id: string, limit = 10) =>
    api.get(`/api/matching/top-offres/${id}`, { params: { limit } }),
  topLaureats: (id: string, limit = 10) =>
    api.get(`/api/matching/top-laureats/${id}`, { params: { limit } }),
};

export const notificationsApi = {
  generate: () => api.post("/api/notifications/generate"),
  list: (params?: object) => api.get("/api/notifications/", { params }),
  forLaureat: (id: string) => api.get(`/api/notifications/laureat/${id}`),
  markSent: (id: number) => api.patch(`/api/notifications/${id}/mark-as-sent`),
};

export const dashboardApi = {
  stats: () => api.get("/api/dashboard/stats"),
  publicStats: () => api.get("/api/dashboard/public-stats"),
  offreDetail: (id_offre: string) => api.get(`/api/dashboard/offre/${id_offre}/detail`),
  laureatDetail: (id_laureat: string) => api.get(`/api/dashboard/laureat/${id_laureat}/detail`),
  entrepriseDetail: (id: number) => api.get(`/api/dashboard/entreprise/${id}/detail`),
};

export const importApi = {
  filieres: () => api.post("/api/import/filieres"),
  competences: () => api.post("/api/import/competences"),
  laureats: () => api.post("/api/import/laureats"),
  offres: () => api.post("/api/import/offres"),
  all: () => api.post("/api/import/all"),
};

export default api;
