// src/services/cartService.ts
import api from "../../api/axios";

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
}

export interface Cart {
  id: number;
  userId: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  items?: CartItem[];
}

export const getCurrentCart = async (): Promise<Cart> => {
  try {
    const res = await api.get<Cart>("/carts/current", {
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
    const res = await api.post<Cart>("/carts", {}, { withCredentials: true });
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
    const res = await api.post<Cart>(`/cart-items/${cartId}/items`, item, {
      withCredentials: true,
    });
    return res.data.data;
  } catch (error) {
    console.error("Error adding item to cart", error);
    throw error;
  }
};
