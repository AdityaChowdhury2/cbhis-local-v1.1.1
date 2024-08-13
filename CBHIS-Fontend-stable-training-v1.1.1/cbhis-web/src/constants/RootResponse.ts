export interface RootResponse<T> {
  isSuccess: boolean;
  data: T;
  message?: any;
}

export interface RootData<T> {
  data: T;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
}
