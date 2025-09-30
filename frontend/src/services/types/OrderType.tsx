// src/types/OrderType.ts
export interface OrderItemDto {
  id: number;
  menuItemId: number;
  menuItemName?: string;
  quantity: number;
  price?: number;
}

export interface OrderDto {
  id: number;
  publicId: string;
  userId: number;
  userName?: string;
  status: string;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  orderItems?: OrderItemDto[];
}
