// src/types/CartProduct.ts
import type { Product } from "../product/fetchProduct";
import type { Combo } from "../product/fetchCombo";

export type CartProduct =
  | (Product & { type: "item" })
  | (Combo & { type: "combo" });
