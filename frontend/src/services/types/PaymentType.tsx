export type PaymentMethod = "COD" | "ONLINE";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface PaymentDto {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequestDto {
  orderId: number;
  paymentMethodCode: string; // "COD" | "ONLINE"
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
}
