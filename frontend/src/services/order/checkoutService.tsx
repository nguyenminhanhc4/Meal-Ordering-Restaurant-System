// src/services/checkoutService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";
import type { Cart } from "../cart/cartService";
import type { OrderDto } from "../types/OrderType"; // định nghĩa DTO trả về

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
