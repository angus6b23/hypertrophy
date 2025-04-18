import axios from 'axios';
import { Measurement } from 'share/interfaces/Measurements';

import { backend } from '.';

export class backendMeasurement {
  static add = async (measurement: Measurement) => {
    const res = await axios.post(
      '/api/measurement',
      measurement,
      await backend.auth.axiosOption(true)
    );
    return res.data.data.id as number;
  };

  static delete = async (remoteId: number) => {
    await axios.delete(`/api/measurement/${remoteId}`, await backend.auth.axiosOption(true));
  };

  static update = async (measurement: Measurement) => {
    if (!measurement.remoteId) return;
    await axios.put(
      `api/measurement/${measurement.remoteId}`,
      measurement,
      await backend.auth.axiosOption(true)
    );
  };
}
