// src/services/cartService.ts
import api from "../../api/axios";
import type { ApiResponse } from "../types/ApiType";
export interface CartItemPayload {
  menuItemId: number;
  quantity: number;
}

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

export interface Cart {
  id: number;
  userId: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  items?: CartItem[];
}

export interface CartDeleteRequest {
  cartId?: number;
  itemIds?: number[];
}

export const getCurrentCart = async (): Promise<Cart> => {
  try {
    const res = await api.get<ApiResponse<Cart>>("/carts/current", {
      withCredentials: true,
    });
    return res.data.data; // assuming your backend returns { status, data, message }
  } catch (error) {
    console.error("Error fetching current cart", error);
    throw error;
  }
};

export const createCart = async (): Promise<Cart> => {
  try {
    const res = await api.post<ApiResponse<Cart>>(
      "/carts",
      {},
      { withCredentials: true }
    );
    return res.data.data;
  } catch (error) {
    console.error("Error creating cart", error);
    throw error;
  }
};

export const addItemToCart = async (
  cartId: number,
  item: CartItemPayload
): Promise<Cart> => {
  try {
    const res = await api.post<ApiResponse<Cart>>(
      `/cart-items/${cartId}/items`,
      item,
      {
        withCredentials: true,
      }
    );
    return res.data.data;
  } catch (error) {
    console.error("Error adding item to cart", error);
    throw error;
  }
};

export const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<Cart> => {
  try {
    const res = await api.put<ApiResponse<Cart>>(
      `/cart-items/${itemId}`,
      { quantity },
      {
        withCredentials: true,
      }
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error updating cart item ${itemId}`, error);
    throw error;
  }
};

export const deleteCartItems = async (
  payload: CartDeleteRequest
): Promise<void> => {
  try {
    await api.delete<ApiResponse<void>>("/cart-items", {
      data: payload,
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error deleting cart items", error);
    throw error;
  }
};
