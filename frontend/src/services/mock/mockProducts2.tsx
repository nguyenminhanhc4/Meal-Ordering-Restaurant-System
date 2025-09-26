export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  categorySlug: string; // Tạm thời thay category_id
  status: "AVAILABLE" | "OUT_OF_STOCK"; // Ánh xạ status_id
  image: string | null; // avatar_url
  createdAt: string; // created_at
  quantity: number; // Từ inventory
  reviews: {
    rating: number;
    comment: string | null;
    userName: string;
    createdAt: string;
  }[]; // Từ reviews
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Sushi",
    price: 120000,
    description: "Sushi tươi ngon với cá hồi và bơ",
    categorySlug: "mon-a",
    status: "AVAILABLE",
    image: "/assets/sushi.jpg",
    createdAt: "2025-09-20T10:00:00Z",
    quantity: 50,
    reviews: [
      {
        rating: 5,
        comment: "Ngon tuyệt, cá hồi tươi!",
        userName: "Nguyen Van A",
        createdAt: "2025-09-21T10:00:00Z",
      },
      {
        rating: 4,
        comment: null,
        userName: "Tran Thi B",
        createdAt: "2025-09-22T10:00:00Z",
      },
    ],
  },
  {
    id: 2,
    name: "Phở",
    price: 80000,
    description: null,
    categorySlug: "mon-a",
    status: "OUT_OF_STOCK",
    image: "/assets/pho.jpg",
    createdAt: "2025-09-15T10:00:00Z",
    quantity: 0,
    reviews: [
      {
        rating: 4,
        comment: "Nước dùng đậm đà",
        userName: "Le Van C",
        createdAt: "2025-09-16T10:00:00Z",
      },
    ],
  },
  {
    id: 3,
    name: "Cà phê",
    price: 35000,
    description: "Cà phê phin nguyên chất, thơm lừng",
    categorySlug: "drinks",
    status: "AVAILABLE",
    image: null,
    createdAt: "2025-09-25T10:00:00Z",
    quantity: 100,
    reviews: [],
  },
];
