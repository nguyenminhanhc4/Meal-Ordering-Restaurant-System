// src/services/table/tableService.ts
import type { ApiResponse } from "../types/ApiType";
import api from "../../api/axios";

export interface TableEntity {
  id: number;
  name: string;
  shortName?: string;
  capacity: number;
  statusId: number;
  statusName: string;
  locationId: number;
  locationName: string;
  positionId: number;
  positionName: string;
  locationDescription: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy tất cả bàn (cần login)
 */
export const getAllTables = async (): Promise<TableEntity[]> => {
  try {
    const response = await api.get<ApiResponse<TableEntity[]>>("/tables");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

/**
 * Lấy bàn theo ID (Admin)
 */
export const getTableById = async (id: number): Promise<TableEntity | null> => {
  try {
    const response = await api.get<ApiResponse<TableEntity>>(`/tables/${id}`, {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching table with id ${id}:`, error);
    return null;
  }
};

/**
 * Lấy danh sách bàn còn trống (Customer hoặc Staff)
 */
export const getAvailableTables = async (): Promise<TableEntity[]> => {
  try {
    const response = await api.get<ApiResponse<TableEntity[]>>(
      "/reservations/tables/available",
      { withCredentials: true }
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
  table: Partial<TableEntity>
): Promise<TableEntity | null> => {
  try {
    const response = await api.post<ApiResponse<TableEntity>>(
      "/tables",
      table,
      {
        withCredentials: true,
      }
    );
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
  table: Partial<TableEntity>
): Promise<TableEntity | null> => {
  try {
    const response = await api.put<ApiResponse<TableEntity>>(
      `/tables/${id}`,
      table,
      {
        withCredentials: true,
      }
    );
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
    await api.delete<ApiResponse<null>>(`/tables/${id}`, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    console.error(`Error deleting table with id ${id}:`, error);
    return false;
  }
};
