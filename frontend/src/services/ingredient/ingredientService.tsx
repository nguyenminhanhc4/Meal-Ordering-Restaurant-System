import api from "../../api/axios";

export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  lastUpdated?: string;
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  const res = await api.get("/ingredients");
  return res.data.data;
}

export async function getIngredientById(id: number): Promise<Ingredient> {
  const res = await api.get(`/ingredients/${id}`);
  return res.data.data;
}

export async function createIngredient(data: Ingredient): Promise<Ingredient> {
  const res = await api.post("/ingredients", data);
  return res.data.data;
}

export async function updateIngredient(
  id: number,
  data: Ingredient
): Promise<Ingredient> {
  const res = await api.put(`/ingredients/${id}`, data);
  return res.data.data;
}

export async function deleteIngredient(id: number): Promise<void> {
  await api.delete(`/ingredients/${id}`);
}
