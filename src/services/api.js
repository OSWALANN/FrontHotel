import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.title || error.message || "Error de conexión con el servidor";
    return Promise.reject(new Error(message));
  },
);

const data = (request) => request.then((response) => response.data);

export const apiClient = api;
export const hotelApi = {
  rooms: {
    list: () => data(api.get("/rooms")),
    create: (payload) => data(api.post("/rooms", payload)),
    update: (id, payload) => data(api.put(`/rooms/${id}`, payload)),
    remove: (id) => data(api.delete(`/rooms/${id}`)),
  },
  roomTypes: () => data(api.get("/room-types")),
  guests: {
    list: (search) => data(api.get("/guests", { params: search ? { search } : {} })),
    create: (payload) => data(api.post("/guests", payload)),
    update: (id, payload) => data(api.put(`/guests/${id}`, payload)),
    remove: (id) => data(api.delete(`/guests/${id}`)),
  },
  reservations: {
    list: (params) => data(api.get("/reservations", { params })),
    create: (payload) => data(api.post("/reservations", payload)),
    update: (id, payload) => data(api.put(`/reservations/${id}`, payload)),
    remove: (id) => data(api.delete(`/reservations/${id}`)),
  },
  notifications: {
    list: () => data(api.get("/notifications")),
    markRead: (id) => data(api.patch(`/notifications/${id}`, { isRead: true })),
  },
  settings: {
    get: () => data(api.get("/settings")),
    update: (payload) => data(api.put("/settings", payload)),
  },
  dashboard: () => data(api.get("/dashboard")),
  reports: (params) => data(api.get("/reports", { params })),
};

export default api;
