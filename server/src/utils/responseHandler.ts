interface ResponseData {
  status: boolean;
  message?: string;
  data?: any;
  httpCode?: number;
  pagination?: {
    count?: number;
    totalPages: number;
    currentPage: number;
    perpage: number;
  };
}

export const sendResponse = (res: any, result: ResponseData) => {
  const { status, message, data, pagination, httpCode = 200 } = result;

  return res.status(httpCode).json({
    status,
    httpCode,
    message,
    data,
    pagination,
  });
};
