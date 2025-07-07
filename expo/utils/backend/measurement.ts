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
    if (!measurement.id) return;
    const { data } = await axios.put(
      `api/measurement/${measurement.id}`,
      measurement,
      await backend.auth.axiosOption(true)
    );
    return unwrapBackend(data);
  };

  static get = async () => {
    const res = await axios.get('/api/measurement', {
      ...(await backend.auth.axiosOption(true)),
      params: { from: new Date(0) },
    });
    return unwrapBackend<Measurement[]>(res.data);
  };
}
