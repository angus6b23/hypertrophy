import axios from 'axios';
import { backendAuth } from './auth';
import { Plan } from 'share/interfaces/Workout';
import { BackendResponse } from 'share/interfaces/Backend';
import { handleRes } from './handleBackendResponse';

export class plans {
  static getUserPlans = async () => {
    const res = await axios.get<BackendResponse<Omit<Plan, 'days'>[]>>(
      '/api/plans',
      await backendAuth.axiosOption(true)
    );
    return handleRes(res.data);
  };

  static getPublicPlans = async () => {
    const res = await axios.get<BackendResponse<Omit<Plan, 'days'>[]>>('/api/plans', {
      ...(await backendAuth.axiosOption()),
      params: { public: true },
    });
    return handleRes(res.data);
  };

  static getPlanDetails = async (id: number) => {
    const res = await axios.get<BackendResponse<Plan>>(
      `/api/plans/${id}`,
      await backendAuth.axiosOption(true)
    );
    return handleRes(res.data);
  };

  static addPlan = async (payload: Plan) => {
    const res = await axios.post<BackendResponse<never>>(
      'api/plans',
      payload,
      await backendAuth.axiosOption(true)
    );
    return handleRes(res.data);
  };

  static updatePlan = async (id: number, payload: Partial<Plan>) => {
    const res = await axios.put<BackendResponse<never>>(
      `api/plans/${id}`,
      payload,
      await backendAuth.axiosOption(true)
    );
    return handleRes(res.data);
  };
  static deletePlan = async (id: number) => {
    const res = await axios.delete<BackendResponse<never>>(
      `api/plans/${id}`,
      await backendAuth.axiosOption(true)
    );
    return handleRes(res.data);
  };
}
