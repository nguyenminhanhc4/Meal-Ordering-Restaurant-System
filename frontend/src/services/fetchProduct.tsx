import type { ApiResponse } from "../services/types/ApiType";
import api from "../api/axios";

export interface Review {
  id: number;
  userName: string;
  userAvatar: string | null; // có thể null
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  avatarUrl: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "COMING_SOON"; // enum thu gọn
  createdAt: string; // có thể parse sang Date nếu muốn
  rating: number;
  sold: number;
  tags: string[];
  reviews: Review[];
  availableQuantity: number; // Số lượng hiện có
}

export const getAllMenuItems = async (): Promise<Product[]> => {
  try {
    const response = await api.get<ApiResponse<Product[]>>("/menu-items");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

export const getMenuItemById = async (
  id: string | number
): Promise<Product | null> => {
  try {
    const response = await api.get<ApiResponse<Product>>(`/menu-items/${id}`);
    return response.data.data; // giả sử backend trả trực tiếp product
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    return null;
  }
};
