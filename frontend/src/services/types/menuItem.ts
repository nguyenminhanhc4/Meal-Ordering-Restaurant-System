export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  avatarUrl?: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  status: string;
  statusId?: number;
  createdAt: string;
  rating?: number;
  sold?: number;
  availableQuantity?: number;
  ingredients?: MenuItemIngredient[];
}

export interface MenuItemIngredient {
  id?: number;
  menuItemId?: number;
  ingredientId: number;
  ingredientName?: string;
  quantityNeeded: number;
}

export interface MenuItemCreateDTO {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  statusId: number;
  avatarUrl?: string;
  availableQuantity?: number;
  ingredients?: MenuItemIngredientCreateDTO[];
}

export interface MenuItemIngredientCreateDTO {
  ingredientId: number;
  quantityNeeded: number;
}

export interface MenuItemUpdateDTO {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  statusId: number;
  avatarUrl?: string;
  availableQuantity?: number;
  ingredients?: MenuItemIngredientUpdateDTO[];
}

export interface MenuItemIngredientUpdateDTO {
  id?: number;
  ingredientId: number;
  quantityNeeded: number;
}

export interface MenuItemSearchRequest {
  name?: string;
  description?: string;
  categoryId?: number;
  statusId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
}

export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minimumStock?: number;
}

export interface StatusParam {
  id: number;
  code: string;
  name: string;
}