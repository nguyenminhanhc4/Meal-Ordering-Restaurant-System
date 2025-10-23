import api from "../../api/axios"; // Import instance axios

// Định nghĩa interface cho danh mục
export interface Category {
  id: number;
  name: string;
  description: string;
  children: Category[];
}

// Hàm gọi API để lấy danh mục
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("/categories/tree"); // Endpoint tương đối, baseURL đã được cấu hình
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

export async function fetchCategoryById(id: number): Promise<Category> {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}
