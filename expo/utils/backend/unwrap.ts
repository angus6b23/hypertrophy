import { BackendResponse } from 'share/interfaces/Backend';

export function unwrapBackend<T>(res: BackendResponse<T>): T {
  if (res.status === 'success') {
    return res.data as T;
  } else {
    throw Error(res.message);
  }
}
