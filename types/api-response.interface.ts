export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  error_code: any;
  meta?: Record<string, any>;
}
