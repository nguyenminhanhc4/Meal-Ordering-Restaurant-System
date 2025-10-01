// src/services/paymentService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";
import type { PaymentDto, PaymentRequestDto } from "../types/PaymentType";
import { AxiosError } from "axios";

// Tạo payment mới
export const createPayment = async (
  request: PaymentRequestDto
): Promise<PaymentDto> => {
  try {
    const res = await api.post<ApiResponse<PaymentDto>>("/payments", request, {
      withCredentials: true,
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating payment", error);
    throw error;
  }
};

export const getPaymentByOrderPublicId = async (
  orderPublicId: string
): Promise<PaymentDto | null> => {
  try {
    const res = await api.get<ApiResponse<PaymentDto>>(
      `/payments/${orderPublicId}`,
      { withCredentials: true }
    );
    return res.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error(
      `Error fetching payment for orderPublicId=${orderPublicId}`,
      axiosError.response?.data?.message ?? axiosError.message
    );
    throw axiosError;
  }
};

// Cập nhật trạng thái payment
export const updatePaymentStatus = async (
  id: number,
  statusCode: string,
  transactionId?: string
): Promise<PaymentDto> => {
  try {
    const res = await api.put<ApiResponse<PaymentDto>>(
      `/payments/${id}/status`,
      {},
      {
        params: {
          statusCode,
          transactionId,
        },
        withCredentials: true,
      }
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error updating payment ${id}`, error);
    throw error;
  }
};
