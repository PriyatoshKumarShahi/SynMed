import axios from "axios";

class AdminAPI {
  constructor() {
    this.api = axios.create({
      baseURL: "/api/admin",
      headers: { "Content-Type": "application/json" },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("adminToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = "/admin";
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email, password) {
    const response = await this.api.post("/login", { email, password });
    if (response.data.success) {
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminAuth", "true");
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuth");
  }

  async getPatients(params = {}) {
    const response = await this.api.get("/patients", { params });
    return response.data;
  }

  async getPatient(id) {
    const response = await this.api.get(`/patients/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await this.api.get("/stats");
    return response.data;
  }


  async updateProfile(data) {
    const response = await this.api.put("/profile", data);
    return response.data;
  }

  async deletePatient(id) {
    const response = await this.api.delete(`/patients/${id}`);
    return response.data;
  }
}

export default new AdminAPI();
