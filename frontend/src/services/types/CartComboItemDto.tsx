// src/services/cart/types.ts
export interface CartComboItemDto {
  id: number;
  comboId: number;
  comboName: string;
  avatarUrl: string;
  price: number;
  quantity: number;
  items: Array<{
    menuItemId: number;
    name: string;
    quantity: number;
  }>;
}
