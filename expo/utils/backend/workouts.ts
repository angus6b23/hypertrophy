import axios from 'axios';
import { backendAuth } from './auth';
import { Workout } from 'share/interfaces/Records';
import { unwrapBackend } from './unwrap';
import { BackendResponse } from 'share/interfaces/Backend';

export class workouts {
  static get = async () => {
    const { data } = await axios.get<BackendResponse<Omit<Workout[], 'exercises'>>>(
      '/api/workouts',
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(data);
  };

  static getDetails = async () => {
    const { data } = await axios.get<BackendResponse<Workout[]>>(
      '/api/workouts',
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(data);
  };

  static add = async (payload: Workout) => {
    const { data } = await axios.post<BackendResponse<{ id: number }>>(
      '/api/workouts',
      payload,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(data);
  };

  static update = async (id: number, payload: Partial<Workout>) => {
    const { data } = await axios.put(
      `/api/workouts/${id}`,
      payload,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend<{ id: number }>(data);
  };

  static delete = async (id: number) => {
    const { data } = await axios.delete<BackendResponse<undefined>>(
      `/api/workouts/${id}`,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(data);
  };
}
