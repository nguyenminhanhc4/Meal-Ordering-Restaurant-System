import api from "../api/axios";

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
}

export const getAllMenuItems = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/menu-items");
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
    const response = await api.get(`/menu-items/${id}`);
    return response.data; // giả sử backend trả trực tiếp product
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    return null;
  }
};
