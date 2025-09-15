import axios from 'axios';
import { backendAuth } from './auth';
import { Plan, PublicPlan, PublicPlanDetails } from 'share/interfaces/Workout';
import { BackendResponse } from 'share/interfaces/Backend';
import { unwrapBackend } from './unwrap';

interface PublicPlanQuery {
  query?: string;
  page?: number;
  asc?: boolean;
  sort?: 'name' | 'update';
}

const defaultQuery: PublicPlanQuery = {
  query: '',
  page: 0,
  asc: false,
  sort: 'update',
};

export class plans {
  static getUserPlans = async () => {
    const res = await axios.get<BackendResponse<Omit<Plan, 'days'>[]>>(
      '/api/plans',
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(res.data);
  };

  static getPublicPlans = async (query: PublicPlanQuery) => {
    const comQuery = { ...defaultQuery, ...query };
    const res = await axios.get<BackendResponse<PublicPlan[]>>('/api/public/plans', {
      ...(await backendAuth.axiosOption(true)),
      params: {
        query: comQuery.query,
        page: comQuery.page,
        asc: comQuery.asc,
        sort: comQuery.sort,
      },
    });
    return unwrapBackend(res.data);
  };

  static getPublicPlanDetails = async (id: number) => {
    const res = await axios.get<BackendResponse<PublicPlanDetails>>(`/api/public/plans/${id}`, {
      ...(await backendAuth.axiosOption(true)),
    });
    return unwrapBackend(res.data);
  };

  static getDetails = async (id: number) => {
    const res = await axios.get<BackendResponse<Plan>>(
      `/api/plans/${id}`,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(res.data);
  };

  static add = async (payload: Plan) => {
    const res = await axios.post<BackendResponse<{ id: number }>>(
      'api/plans',
      payload,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(res.data);
  };

  static update = async (localId: string, payload: Partial<Plan>) => {
    const res = await axios.put<BackendResponse<never>>(
      `api/plans/${localId}`,
      payload,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(res.data);
  };
  static delete = async (localId: string) => {
    const res = await axios.delete<BackendResponse<never>>(
      `api/plans/${localId}`,
      await backendAuth.axiosOption(true)
    );
    return unwrapBackend(res.data);
  };
}
