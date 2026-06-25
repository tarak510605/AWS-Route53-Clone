import apiClient from "@/lib/axios";
import type { User } from "@/types";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/api/auth/login", {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/api/auth/logout");
  },

  async getMe(token: string): Promise<User> {
    const { data } = await apiClient.get<User>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
