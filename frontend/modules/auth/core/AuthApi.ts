import axios from 'axios';
import { config } from '../../../lib/config';

const API_URL = `${config.apiUrl}/api/auth`;
class AuthApi {
  static async register(email: string, password: string) {
    const response = await axios.post(`${API_URL}/register`, { email, password });
    return response.data;
  }

  static async verifyEmail(token: string) {
    const response = await axios.post(`${API_URL}/verify-email`, { token });
    return response.data;
  }

  static async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  static async forgotPassword(email: string) {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  }

  static async resetPassword(token: string, newPassword: string) {
    const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
    return response.data;
  }

  static logout() {
    localStorage.removeItem('token');
  }

  static getToken() {
    return localStorage.getItem('token');
  }
}

export default AuthApi;