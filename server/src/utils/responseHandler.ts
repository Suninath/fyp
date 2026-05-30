interface ResponseData {
  status: boolean;
  message?: string;
  data?: any;
  httpCode?: number;
  [key: string]: any;
  pagination?: {
    count?: number;
    totalPages: number;
    currentPage: number;
    perpage: number;
  };
}

export const sendResponse = (res: any, result: ResponseData) => {
  const { status, message, data, pagination, httpCode = 200, ...rest } = result;

  return res.status(httpCode).json({
    status,
    httpCode,
    message,
    data,
    pagination,
    ...rest,
  });
};
