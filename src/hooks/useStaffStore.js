import { getAuth } from '../utils/auth';

export function useStaffStoreId() {
  const { storeId } = getAuth();
  return storeId;
}

export function hasStaffStore() {
  return getAuth().storeId != null;
}
