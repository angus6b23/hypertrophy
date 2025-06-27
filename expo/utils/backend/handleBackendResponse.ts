import { BackendResponse } from 'share/interfaces/Backend';

export function handleRes<T>(response: BackendResponse<T>) {
  if (response.status === 'error') {
    throw new Error(response.message as string);
  } else {
    return response.data as T;
  }
}
