export class ApiResponseDto<T> {
  data: T[] | T;
  error: string | null;
  isSuccess: boolean;
  message: string;

  constructor(
    message: string,
    data: T | T[] | null = null,
    error: string | null = null,
    isSuccess = true,
  ) {
    this.message = message;
    this.data = data;
    this.error = error;
    this.isSuccess = isSuccess;
  }
}

export class PaginatedApiResponseDto<T> extends ApiResponseDto<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;

  constructor(
    data: T[] | T,
    currentPage: number,
    totalPages: number,
    pageSize: number,
    totalItems: number,
    error: string | null = null,
    message: string,
    isSuccess = true,
  ) {
    super(message, data, error, isSuccess);
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.pageSize = pageSize;
    this.totalItems = totalItems;
  }
}
