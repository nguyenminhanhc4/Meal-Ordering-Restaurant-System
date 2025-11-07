// src/services/cart/comboCartService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";

/* -------------------------------------------------------------------------- */
/* COMBO CART MODELS                                                         */
/* -------------------------------------------------------------------------- */

export interface AddComboPayload {
  comboId: number;
  quantity: number;
}

export interface ComboItemInCombo {
  id: number;
  name: string;
  quantity: number;
  price: number;
  avatarUrl?: string;
  category?: string;
}

export interface CartComboItem {
  id: number;
  comboId: number;
  comboName: string;
  avatarUrl?: string;
  price: number;
  quantity: number;
  status: string;
  description?: string;
  categoryName?: string;
  items: ComboItemInCombo[];
}

/* -------------------------------------------------------------------------- */
/* COMBO CART API FUNCTIONS                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Thêm combo vào giỏ hàng
 */
export const addComboToCart = async (
  cartId: number,
  payload: AddComboPayload
): Promise<CartComboItem> => {
  const res = await api.post<ApiResponse<CartComboItem>>(
    `/cart-combos/${cartId}/items`,
    payload,
    { withCredentials: true }
  );
  return res.data.data;
};

/**
 * Lấy danh sách combo trong giỏ
 */
export const getCartCombos = async (
  cartId: number
): Promise<CartComboItem[]> => {
  const res = await api.get<ApiResponse<CartComboItem[]>>(
    `/cart-combos/${cartId}`,
    { withCredentials: true }
  );
  return res.data.data;
};

export const updateCartCombo = async (comboId: number, quantity: number) => {
  const res = await api.put<ApiResponse<CartComboItem>>(
    `/cart-combos/${comboId}`,
    { quantity },
    { withCredentials: true }
  );
  return res.data.data;
};

/**
 * Xóa 1 combo khỏi giỏ
 */
export const removeComboFromCart = async (
  comboItemId: number
): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/cart-combos/${comboItemId}`, {
    withCredentials: true,
  });
};

/**
 * Xóa nhiều combo khỏi giỏ
 */
export const deleteCartCombos = async (payload: {
  comboIds?: number[];
  cartId?: number;
}): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/cart-combos`, {
    data: payload,
    withCredentials: true,
  });
};

/**
 * Xóa toàn bộ combo trong giỏ hàng
 */
export const clearCartCombos = async (cartId: number): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/cart-combos`, {
    data: { cartId },
    withCredentials: true,
  });
};
