import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { decodeJwt } from 'jose';

import { backend } from '.';

export class backendAuth {
  static axiosOption = async (auth = false) => {
    if (auth) {
      return {
        baseURL: backend.url,
        headers: {
          Authorization: `Bearer ${await this.readAccessToken()}`,
        },
      };
    } else {
      return {
        baseURL: backend.url,
      };
    }
  };

  static signUp = async (username: string, password: string, displayName: string) => {
    await axios.post(
      '/api/auth/signup',
      { username, password, displayName },
      await this.axiosOption()
    );
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
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  };

  static me = async () => {
    const res = await axios.get('api/me', await this.axiosOption(true));
    return {
      username: res.data.data.username as string,
      displayName: res.data.data.displayName as string,
    };
  };

  static readAccessToken = async (): Promise<string> => {
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
    const res = await axios.post('/api/auth/refrsh', { refreshToken }, await this.axiosOption());
    await SecureStore.setItemAsync('accessToken', res.data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.data.refreshToken);
    return res.data.accessToken as string;
  };
}
