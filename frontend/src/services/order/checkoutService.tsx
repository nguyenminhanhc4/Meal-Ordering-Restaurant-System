// src/services/checkoutService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";
import type { Cart } from "../cart/cartService";
import type { OrderDto, OrderDtoDetail } from "../types/OrderType"; // định nghĩa DTO trả về
import type { Page } from "../types/PageType";
import axios from "axios";

export const checkoutCart = async (cart: Cart): Promise<OrderDto> => {
  try {
    const res = await api.post<ApiResponse<OrderDto>>(
      "/orders/checkout",
      cart,
      { withCredentials: true }
    );
    return res.data.data;
  } catch (error) {
    console.error("Error checking out cart", error);
    throw error;
  }
};

export const getOrdersByUser = async (
  page = 0,
  size = 6,
  status?: string,
  signal?: AbortSignal
): Promise<Page<OrderDto>> => {
  try {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;

    const res = await api.get<ApiResponse<Page<OrderDto>>>("/orders/me", {
      params,
      withCredentials: true,
      signal,
    });
    return res.data.data;
  } catch (error) {
    console.error(
      "Error fetching orders for user",
      axios.isAxiosError(error) ? error.response?.data ?? error.message : error
    );
    throw error;
  }
};

// Lấy chi tiết một order theo publicId
export const getOrderById = async (
  orderPublicId: string
): Promise<OrderDtoDetail> => {
  try {
    const res = await api.get<ApiResponse<OrderDtoDetail>>(
      `/orders/${orderPublicId}`,
      {
        withCredentials: true,
      }
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching order ${orderPublicId}`, error);
    throw error;
  }
};

export const getAllOrders = async (
  page: number = 0,
  size: number = 10,
  status?: string,
  paymentStatus?: string, // thêm param mới
  keyword?: string
): Promise<Page<OrderDto>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (status) params.append("status", status);
    if (paymentStatus) params.append("paymentStatus", paymentStatus); // thêm đây
    if (keyword) params.append("keyword", keyword);

    const res = await api.get<ApiResponse<Page<OrderDto>>>(
      `/orders?${params.toString()}`,
      { withCredentials: true }
    );
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all orders", error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng (ví dụ: APPROVED, DELIVERING, DELIVERED, CANCELLED)
export const updateOrderStatus = async (
  publicId: string,
  status: string
): Promise<OrderDto> => {
  try {
    const res = await api.put<ApiResponse<OrderDto>>(
      `/orders/${publicId}/status?status=${status}`,
      {},
      { withCredentials: true }
    );
    return res.data.data;
  } catch (error) {
    console.error("Error updating order status", error);
    throw error;
  }
};

// Cập nhật trạng thái thanh toán theo orderId hoặc publicId
export const updatePaymentStatusByOrder = async (
  orderId: number,
  statusCode: string
): Promise<void> => {
  try {
    await api.put(
      `/payments/orders/${orderId}/payment-status?statusCode=${statusCode}`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Error updating payment status", error);
    throw error;
  }
};

export const cancelOrder = async (orderPublicId: string): Promise<OrderDto> => {
  try {
    const res = await api.put<ApiResponse<OrderDto>>(
      `/orders/${orderPublicId}/cancel`,
      {},
      { withCredentials: true }
    );
    return res.data.data;
  } catch (error) {
    console.error("Error cancelling order", error);
    throw error;
  }
};
