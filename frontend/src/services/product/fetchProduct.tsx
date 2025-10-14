import type { ApiResponse } from "../../services/types/ApiType";
import api from "../../api/axios";
import type { Page } from "../types/PageType";

export interface Review {
  id: number;
  userId: string;
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

export const getAllMenuItems = async (
  page: number = 0,
  size: number = 10,
  search = "",
  sort = "popular",
  categorySlug?: string
): Promise<Page<Product>> => {
  try {
    const params: Record<string, unknown> = { page, size, search, sort };
    if (categorySlug) params.categorySlug = categorySlug; // 👈 thêm vào nếu có

    const response = await api.get<ApiResponse<Page<Product>>>(`/menu-items`, {
      params,
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);

    // Trả về trang rỗng để tránh crash
    return {
      content: [],
      pageable: { pageNumber: page, pageSize: size },
      totalPages: 0,
      totalElements: 0,
      first: true,
      last: true,
      number: page,
      size: size,
      numberOfElements: 0,
    };
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

export const getTopPopularMenuItems = async (): Promise<Product[]> => {
  try {
    const response = await api.get<ApiResponse<Product[]>>(
      "/menu-items/top-popular"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top popular menu items:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};
