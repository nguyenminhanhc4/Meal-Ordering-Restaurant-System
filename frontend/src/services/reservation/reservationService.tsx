import type { ApiResponse } from "../types/ApiType";
import api from "../../api/axios";
export interface Reservation {
  id: number;
  publicId: string;
  userId: number;
  reservationTime: string;
  numberOfPeople: number;
  note?: string;
  statusId: number;
  statusName: string;
  tableIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationRequest {
  reservationTime: string;
  numberOfPeople: number;
  note?: string;
  tableIds: number[];
}

/**
 * CUSTOMER: tạo đặt bàn cho chính mình
 */
export const createMyReservation = async (
  reservation: CreateReservationRequest
): Promise<Reservation | null> => {
  try {
    const response = await api.post<ApiResponse<Reservation>>(
      "/reservations/me",
      reservation
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating reservation:", error);
    return null;
  }
};

/**
 * CUSTOMER: lấy danh sách đặt bàn của mình
 */
export const getMyReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await api.get<ApiResponse<Reservation[]>>(
      "/reservations/me",
      {
        withCredentials: true,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching my reservations:", error);
    return [];
  }
};

/**
 * CUSTOMER: lấy chi tiết 1 đặt bàn
 */
export const getMyReservationByPublicId = async (
  publicId: string
): Promise<Reservation | null> => {
  try {
    const response = await api.get<ApiResponse<Reservation>>(
      `/reservations/me/${publicId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching reservation ${publicId}:`, error);
    return null;
  }
};

/**
 * CUSTOMER: cập nhật đặt bàn của mình
 */
export const updateMyReservation = async (
  publicId: string,
  data: Partial<Reservation>
): Promise<Reservation | null> => {
  try {
    const response = await api.put<ApiResponse<Reservation>>(
      `/reservations/me/${publicId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating reservation ${publicId}:`, error);
    return null;
  }
};

/**
 * CUSTOMER: xóa đặt bàn của mình
 */
export const deleteMyReservation = async (
  publicId: string
): Promise<boolean> => {
  try {
    await api.delete<ApiResponse<null>>(`/reservations/me/${publicId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting reservation ${publicId}:`, error);
    return false;
  }
};

/**
 * ADMIN / STAFF: lấy tất cả reservation
 */
export const getAllReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await api.get<ApiResponse<Reservation[]>>("/reservations");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all reservations:", error);
    return [];
  }
};

/**
 * ADMIN / STAFF: cập nhật reservation bất kỳ
 */
export const updateReservation = async (
  id: number,
  data: Partial<Reservation>
): Promise<Reservation | null> => {
  try {
    const response = await api.put<ApiResponse<Reservation>>(
      `/reservations/${id}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating reservation with id ${id}:`, error);
    return null;
  }
};

/**
 * ADMIN / STAFF: xóa reservation bất kỳ
 */
export const deleteReservation = async (id: number): Promise<boolean> => {
  try {
    await api.delete<ApiResponse<null>>(`/reservations/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting reservation with id ${id}:`, error);
    return false;
  }
};
