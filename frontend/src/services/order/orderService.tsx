import api from "../../api/axios";

export interface OrderItem {
  menuItemId: number;
  menuItemName: string;
  imageUrl: string;
  status: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
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

export async function fetchOrderHistory({
  page = 0,
  size = 10,
  keyword = "",
  status = "",
  fromDate = "",
  toDate = "",
  sort = "createdAt,desc",
}: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    // 🔍 chỉ set những params có giá trị thực
    if (keyword.trim()) params.set("keyword", keyword);
    if (status.trim()) params.set("status", status);
    if (fromDate.trim()) params.set("fromDate", fromDate);
    if (toDate.trim()) params.set("toDate", toDate);

    const response = await api.get<OrderPage>(
      `/orders/history?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi fetch order history:", error);
    throw error;
  }
}
