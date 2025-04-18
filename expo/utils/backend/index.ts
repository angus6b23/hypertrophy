import axios from 'axios';

import { backendAuth } from './auth';
import { backendMeasurement } from './measurement';
import { instance } from '../stores/account-store';

interface Response<T> {
  success: boolean;
  data?: T;
  error?: Error | unknown;
}

export class backend {
  static url = instance;
  static auth = backendAuth;
  static measurement = backendMeasurement;

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
}
