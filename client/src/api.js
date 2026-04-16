import axios from "axios";

const BASE_URL = "https://job-tracker-backend-wheat.vercel.app";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Backend reads req.headers.authorization directly (no "Bearer" prefix)
    config.headers["authorization"] = token;
  }
  return config;
});

// Log all responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data,
    );
    return response;
  },
  (error) => {
    console.error(
      `[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const signup = (name, email, password) =>
  api.post("/users/signup", { name, email, password });

export const login = (email, password) =>
  api.post("/users/login", { email, password });

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const getJobs = (params = {}) => api.get("/jobs", { params });

export const getJobById = (jobId) => api.get(`/jobs/${jobId}`);

export const createJob = (data) => api.post("/jobs", data);

export const updateJob = async (jobId, userIdOrData, status, notes) => {
  const payload =
    userIdOrData && typeof userIdOrData === "object" && !Array.isArray(userIdOrData)
      ? userIdOrData
      : { status, notes };

  const requests = [];

  if ("status" in payload && payload.status !== undefined) {
    requests.push({ status: payload.status });
  }

  // Split multi-field updates so the current deployed backend does not receive
  // the broken `{ status, notes }` combination, while still working with the fixed backend code.
  if ("notes" in payload && payload.notes !== undefined) {
    if (payload.notes !== "" || !("status" in payload)) {
      requests.push({ notes: payload.notes });
    }
  }

  if (requests.length === 0) {
    return Promise.resolve({
      data: { success: true, message: "No changes to update" },
    });
  }

  let response;

  for (const requestPayload of requests) {
    response = await api.put(`/jobs/${jobId}`, requestPayload);
  }

  return response;
};

export const deleteJob = (jobId) => api.delete(`/jobs/${jobId}`);

export const getJobStats = () => api.get("/jobs/stats");

export default api;
