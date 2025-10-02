// src/services/mockPaymentService.ts
import api from "../../api/axios";
import type { PaymentDto, PaymentRequestDto } from "../types/PaymentType";

// Tạo payment (initiate)
export const initiatePayment = async (request: PaymentRequestDto) => {
  const res = await api.post(`/mock-payments/initiate`, request, {
    withCredentials: true,
  });
  return res.data; // { paymentId, redirectUrl }
};

// Lấy thông tin payment
export const getMockPayment = async (publicId: string) => {
  const res = await api.get<PaymentDto>(`/mock-payments/checkout/${publicId}`);
  return res.data;
};

// Approve
export const approveMockPayment = async (publicId: string) => {
  const res = await api.post(
    `/mock-payments/approve/${publicId}`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

// Cancel
export const cancelMockPayment = async (publicId: string) => {
  const res = await api.post(
    `/mock-payments/cancel/${publicId}`,
    {},
    { withCredentials: true }
  );
  return res.data;
};
