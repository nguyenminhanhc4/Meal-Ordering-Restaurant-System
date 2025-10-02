// src/services/checkoutService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";
import type { Cart } from "../cart/cartService";
import type { OrderDto } from "../types/OrderType"; // định nghĩa DTO trả về
import type { Page } from "../types/PageType";

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
  page: number = 0,
  size: number = 6
): Promise<Page<OrderDto>> => {
  try {
    const res = await api.get<ApiResponse<Page<OrderDto>>>(
      `/orders/me?page=${page}&size=${size}`,
      {
        withCredentials: true,
      }
    );
    return res.data.data; // trả về Page<OrderDto>
  } catch (error) {
    console.error("Error fetching orders for user", error);
    throw error;
  }
};

// Lấy chi tiết một order theo publicId
export const getOrderById = async (
  orderPublicId: string
): Promise<OrderDto> => {
  try {
    const res = await api.get<ApiResponse<OrderDto>>(
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
