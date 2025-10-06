// src/services/cart/cartService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";

/* -------------------------------------------------------------------------- */
/* 🧩 Interface models                                                        */
/* -------------------------------------------------------------------------- */

/** Dữ liệu gửi khi thêm sản phẩm vào giỏ */
export interface CartItemPayload {
  menuItemId: number;
  quantity: number;
}

/** Món trong giỏ hàng */
export interface CartItem {
  id: number;
  menuItemId: number;
  menuItemName?: string;
  avatarUrl?: string;
  quantity: number;
  price?: number;
  status: string;
  description?: string;
  categoryName?: string;
  availableQuantity: number;
}

/** Giỏ hàng người dùng */
export interface Cart {
  id: number;
  userId: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  items?: CartItem[];
}

/** Payload để xoá nhiều món hoặc giỏ hàng */
export interface CartDeleteRequest {
  cartId?: number;
  itemIds?: number[];
}

/* -------------------------------------------------------------------------- */
/* 🧭 API FUNCTIONS                                                           */
/* -------------------------------------------------------------------------- */

/**
 * 🔹 Lấy giỏ hàng hiện tại của user
 */
export const getCurrentCart = async (): Promise<Cart> => {
  const res = await api.get<ApiResponse<Cart>>("/carts/current", {
    withCredentials: true,
  });
  return res.data.data;
};

/**
 * 🔹 Tạo mới giỏ hàng cho user (nếu chưa có)
 */
export const createCart = async (): Promise<Cart> => {
  const res = await api.post<ApiResponse<Cart>>(
    "/carts",
    {},
    { withCredentials: true }
  );
  return res.data.data;
};

/**
 * 🔹 Thêm món vào giỏ hàng
 * @param cartId id của giỏ hàng
 * @param item thông tin món (menuItemId, quantity)
 */
export const addItemToCart = async (
  cartId: number,
  item: CartItemPayload
): Promise<Cart> => {
  const res = await api.post<ApiResponse<Cart>>(
    `/cart-items/${cartId}/items`,
    item,
    {
      withCredentials: true,
    }
  );
  return res.data.data;
};

/**
 * 🔹 Cập nhật số lượng món trong giỏ
 */
export const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<Cart> => {
  const res = await api.put<ApiResponse<Cart>>(
    `/cart-items/${itemId}`,
    { quantity },
    { withCredentials: true }
  );
  return res.data.data;
};

/**
 * 🔹 Xóa nhiều món trong giỏ (hoặc toàn bộ giỏ)
 */
export const deleteCartItems = async (
  payload: CartDeleteRequest
): Promise<void> => {
  await api.delete<ApiResponse<void>>("/cart-items", {
    data: payload,
    withCredentials: true,
  });
};

/**
 * 🔹 Thanh toán giỏ hàng (ví dụ: checkout toàn bộ hoặc theo itemIds)
 */
export const checkoutCart = async (
  cartId: number,
  itemIds?: number[]
): Promise<void> => {
  await api.post<ApiResponse<void>>(
    `/carts/${cartId}/checkout`,
    { itemIds },
    { withCredentials: true }
  );
};
