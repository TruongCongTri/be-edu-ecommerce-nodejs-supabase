

export interface ApiErrorResponse<T = any> {
  success: false;
  message: string;
  error_code?: string | number;
  errors?: T; // could be string[], field errors, etc.
}
