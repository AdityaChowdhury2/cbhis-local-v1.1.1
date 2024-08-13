export interface ApiResponse {
  isSuccess: boolean;
  message?: string;
}

export interface ApiResponseWithData<T> {
  isSuccess: boolean;
  data: T;
  message?: string;
}
