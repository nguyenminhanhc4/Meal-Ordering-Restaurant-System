// src/types/OrderType.ts
export interface OrderItemDto {
  id: number;
  menuItemId: number;
  menuItemName?: string;
  quantity: number;
  price: number;
}

export interface OrderDtoDetail {
  id: number;
  publicId: string;
  userId: number;
  userName?: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt?: string;
  updatedAt?: string;
  orderItems?: OrderItemDto[];
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
