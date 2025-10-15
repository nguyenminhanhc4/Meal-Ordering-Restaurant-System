import api from "../../api/axios";

export interface OrderItem {
  menuItemName: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderPage {
  content: Order[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export async function fetchOrderHistory(params: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
}) {
  const response = await api.get<OrderPage>("/orders/history", {
    params,
  });
  return response.data;
}
