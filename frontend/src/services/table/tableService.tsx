import type { ApiResponse } from "../types/ApiType";
import api from "../../api/axios";

export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  statusId: number;
  statusName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy tất cả bàn (cần login)
 */
export const getAllTables = async (): Promise<Table[]> => {
  try {
    const response = await api.get<ApiResponse<Table[]>>("/tables");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

/**
 * Lấy bàn theo ID (Admin)
 */
export const getTableById = async (id: number): Promise<Table | null> => {
  try {
    const response = await api.get<ApiResponse<Table>>(`/tables/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching table with id ${id}:`, error);
    return null;
  }
};

/**
 * Lấy danh sách bàn còn trống (Customer hoặc Staff)
 */
export const getAvailableTables = async (): Promise<Table[]> => {
  try {
    const response = await api.get<ApiResponse<Table[]>>(
      "/reservations/tables/available"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching available tables:", error);
    return [];
  }
};

/**
 * Tạo bàn (Admin)
 */
export const createTable = async (
  table: Partial<Table>
): Promise<Table | null> => {
  try {
    const response = await api.post<ApiResponse<Table>>("/tables", table);
    return response.data.data;
  } catch (error) {
    console.error("Error creating table:", error);
    return null;
  }
};

/**
 * Cập nhật bàn (Admin)
 */
export const updateTable = async (
  id: number,
  table: Partial<Table>
): Promise<Table | null> => {
  try {
    const response = await api.put<ApiResponse<Table>>(`/tables/${id}`, table);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating table with id ${id}:`, error);
    return null;
  }
};

/**
 * Xóa bàn (Admin)
 */
export const deleteTable = async (id: number): Promise<boolean> => {
  try {
    await api.delete<ApiResponse<null>>(`/tables/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting table with id ${id}:`, error);
    return false;
  }
};
