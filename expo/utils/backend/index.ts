import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Measurement } from 'share/interfaces/Measurements';

interface Response<T> {
  success: boolean;
  data?: T;
  error?: Error | unknown;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export class backend {
  private static defaultUrl = 'http://localhost:3000';

  static url = process.env.EXPO_PUBLIC_BACKEND_URL || this.defaultUrl;

  static getBackendStatus = async (): Promise<Response<unknown>> => {
    try {
      const res = await axios.get(`/api/status`, {
        baseURL: this.url,
      });
      return {
        success: true,
        data: res.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err,
      };
    }
  };

  private static getToken = async (): Promise<null | Tokens> => {
    const tokenString = await SecureStore.getItemAsync('tokens');
    try {
      if (tokenString) {
        const token = JSON.parse(tokenString) as Tokens;
        return token;
      }
      return null;
    } catch {
      return null;
    }
  };
  static insertMeasurement = async (measurement: Measurement): Promise<Response<Measurement>> => {
    try {
      const token = await this.getToken();
      if (token) {
        const res = await axios.post('/api/measurement', measurement, {
          baseURL: this.url,
          headers: { Authorization: `Bearer ${token.accessToken}` },
        });
        return {
          success: true,
          data: res.data,
        };
      }
      return {
        success: false,
        error: new Error('Not Logged In'),
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  };
}
