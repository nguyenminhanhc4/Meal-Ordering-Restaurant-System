// src/services/combo/fetchCombo.ts
import api from "../../api/axios";
import type { ApiResponse } from "../../services/types/ApiType";
import type { Page } from "../types/PageType";

// 🔹 Kiểu dữ liệu cho Category (theo admin combo)
export interface Category {
  id: number;
  name: string;
  parentCategory?: Category | null;
}

// 🔹 Kiểu dữ liệu cho StatusParam
export interface StatusParam {
  id: number;
  code: string;
}

// 🔹 Kiểu dữ liệu cho MenuItem trong combo
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  avatarUrl: string;
  categoryName: string | null;
}

// 🔹 Kiểu dữ liệu cho Combo Item
export interface ComboItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  avatarUrl: string;
  category: string;
}

// 🔹 Kiểu dữ liệu cho Combo
export interface Combo {
  id: number;
  name: string;
  description: string;
  avatarUrl: string;
  price: number;
  category: string;
  status: string;
  items: ComboItem[];
}

// 🔹 Kiểu dữ liệu cho payload POST/PUT
export interface ComboRequest {
  name: string;
  description: string;
  avatarUrl: string;
  categoryId: number;
  statusId: number;
  items: {
    menuItemId: number;
    quantity: number;
  }[];
}

// ==========================
// 🔹 Service Functions
// ==========================

// Lấy danh sách combos (pagination + filter + search + sort)
export const getAllCombos = async (
  page = 0,
  size = 10,
  search = "",
  categoryId?: number,
  statusId?: number,
  sort = "name-asc"
): Promise<Page<Combo>> => {
  try {
    const params: Record<string, unknown> = { page, size, search, sort };
    if (categoryId) params.categoryId = categoryId;
    if (statusId) params.statusId = statusId;

    const response = await api.get<ApiResponse<Page<Combo>>>("/admin/combos", {
      params,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching combos:", error);
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

// Lấy combo theo ID
export const getComboById = async (
  id: number | string
): Promise<Combo | null> => {
  try {
    const response = await api.get<Combo>(`/admin/combos/${id}`);
    console.log("response combo", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching combo ${id}:`, error);
    return null;
  }
};

// Tạo combo mới
export const createCombo = async (
  payload: ComboRequest
): Promise<Combo | null> => {
  try {
    const response = await api.post<ApiResponse<Combo>>(
      "/admin/combos",
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating combo:", error);
    return null;
  }
};

// Cập nhật combo
export const updateCombo = async (
  id: number | string,
  payload: ComboRequest
): Promise<Combo | null> => {
  try {
    const response = await api.put<ApiResponse<Combo>>(
      `/admin/combos/${id}`,
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating combo ${id}:`, error);
    return null;
  }
};

// Xóa combo
export const deleteCombo = async (id: number | string): Promise<boolean> => {
  try {
    await api.delete(`/admin/combos/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting combo ${id}:`, error);
    return false;
  }
};
