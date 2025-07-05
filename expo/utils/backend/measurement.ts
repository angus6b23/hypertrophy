import axios from 'axios';
import { Measurement } from 'share/interfaces/Measurements';

import { backend } from '.';
import { unwrapBackend } from './unwrap';

export class backendMeasurement {
  static add = async (measurement: Measurement) => {
    const res = await axios.post(
      '/api/measurement',
      measurement,
      await backend.auth.axiosOption(true)
    );
    return unwrapBackend<{ id: number }>(res.data);
  };

  static delete = async (remoteId: number) => {
    const { data } = await axios.delete(
      `/api/measurement/${remoteId}`,
      await backend.auth.axiosOption(true)
    );
    return unwrapBackend(data);
  };

  static update = async (measurement: Measurement) => {
    if (!measurement.remoteId) return;
    const { data } = await axios.put(
      `api/measurement/${measurement.remoteId}`,
      measurement,
      await backend.auth.axiosOption(true)
    );
    return unwrapBackend(data);
  };
}
