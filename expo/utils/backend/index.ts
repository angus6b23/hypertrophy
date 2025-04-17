import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { decodeJwt } from 'jose';
import { Measurement } from 'share/interfaces/Measurements';

import { instance } from '../stores/account-store';

interface Response<T> {
  success: boolean;
  data?: T;
  error?: Error | unknown;
}

export class backend {
  static url = instance;
  static axiosOption = async (auth = false) => {
    if (auth) {
      return {
        baseURL: this.url,
        headers: {
          Authorization: `Bearer ${await this.readAccessToken()}`,
        },
      };
    } else {
      return {
        baseURL: this.url,
      };
    }
  };

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

  static insertMeasurement = async (measurement: Measurement): Promise<Response<Measurement>> => {
    try {
      const res = await axios.post('/api/measurement', measurement, await this.axiosOption(true));
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  };

  static login = async (username: string, password: string) => {
    try {
      const res = await axios.post(
        '/api/auth/login',
        { username, password },
        await this.axiosOption()
      );
      const token = res.data.data;
      await SecureStore.setItemAsync('accessToken', token.accessToken);
      await SecureStore.setItemAsync('refreshToken', token.refreshToken);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  };

  static logout = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  };

  static me = async () => {
    const res = await axios.get('api/me', await this.axiosOption(true));
    return {
      username: res.data.data.username as string,
      displayName: res.data.data.displayName as string,
    };
  };

  static readAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (!accessToken) {
      throw new Error('Access token not found');
    }
    const token = decodeJwt(accessToken);
    if (token.exp! < Date.now() / 1000) {
      return await this.refresh();
    }
    return accessToken;
  };

  static refresh = async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const res = await axios.post(
      '/api/auth/refresh',
      { refreshToken: refreshToken },
      { baseURL: this.url }
    );
    await SecureStore.setItemAsync('accessToken', res.data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.data.refreshToken);
    return res.data.accessToken as string;
  };
}
