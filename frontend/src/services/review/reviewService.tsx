import type { ApiResponse } from "../types/ApiType";
import api from "../../api/axios";

export interface Review {
  id: number;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

/**
 * Tạo review cho 1 món
 */
export const createReview = async (
  menuId: number,
  review: CreateReviewRequest
): Promise<Review | null> => {
  try {
    const response = await api.post<ApiResponse<Review>>(
      `/reviews/${menuId}`,
      review
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating review:", error);
    return null;
  }
};

/**
 * Lấy danh sách review của 1 món (nếu muốn phân trang)
 */
export const getReviewsByMenu = async (
  menuId: number
): Promise<Review[] | null> => {
  try {
    const response = await api.get<ApiResponse<Review[]>>(
      `/menu/${menuId}/reviews`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching reviews for menu ${menuId}:`, error);
    return null;
  }
};

/**
 * Cập nhật review của chính user
 */
export const updateReview = async (
  reviewId: number,
  data: Partial<CreateReviewRequest>
): Promise<Review | null> => {
  try {
    const response = await api.put<ApiResponse<Review>>(
      `/reviews/${reviewId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    return null;
  }
};

/**
 * Xóa review của chính user
 */
export const deleteReview = async (reviewId: number): Promise<boolean> => {
  try {
    await api.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    return false;
  }
};
