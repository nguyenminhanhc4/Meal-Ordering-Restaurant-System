import {
  Carousel,
  Card,
  Button,
  Spinner,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { getTopPopularMenuItems } from "../../services/product/fetchProduct";
import type { Product } from "../../services/product/fetchProduct";
import { FaStar, FaStarHalf, FaRegStar, FaShoppingCart } from "react-icons/fa";

export default function FeaturedMenu() {
  const [dishes, setDishes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Chia slide cố định ---
  const slidesCount = 3; // giữ nguyên như cũ

  useEffect(() => {
    const fetchTopDishes = async () => {
      setLoading(true);
      const data = await getTopPopularMenuItems();
      setDishes(data);
      setLoading(false);
    };
    fetchTopDishes();
  }, []);

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  const chunkedDishes = chunkArray(dishes, slidesCount);

  return (
    <section id="menu" className="pt-5 h-screen bg-amber-50 text-center px-4">
      <h2 className="text-4xl font-bold text-amber-900">Món nổi bật</h2>
      <Carousel
        slideInterval={3000}
        className="max-w-8xl mx-auto h-[85%] px-2 sm:px-4"
        leftControl={
          <button className="w-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        }
        rightControl={
          <button className="w-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        }>
        {chunkedDishes.map((group, idx) => (
          <div
            key={idx}
            className="flex gap-4 justify-center flex-wrap sm:flex-nowrap">
            {group.map((dish) => (
              <Card
                key={dish.id}
                // Giữ nguyên kích thước và hover, thay đổi màu nền/viền sang tông kem/vàng nhẹ nhàng hơn
                className="flex-1 min-w-[250px] max-w-sm w-full mx-auto !bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
                {/* Hình ảnh - chiếm ưu thế, bo góc trên */}
                <div className="relative overflow-hidden">
                  <img
                    src={dish.avatarUrl}
                    alt={dish.name}
                    className="object-cover h-56 w-full group-hover:scale-105 transition-transform duration-500" // Ảnh cao 56, có hiệu ứng zoom khi hover
                  />
                  {/* Tags - Đặt chồng lên ảnh để tiết kiệm không gian và thu hút */}
                  <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                    {dish.tags?.slice(0, 2).map(
                      (
                        tag,
                        i // Giới hạn 2 tags để không che mất ảnh
                      ) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2 py-0.5 bg-red-500/90 text-white rounded-full shadow-md backdrop-blur-sm">
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between h-auto">
                  {/* Tên món ăn - Rõ ràng, màu sắc nổi bật hơn */}
                  <h3 className="text-2xl font-extrabold text-stone-900 line-clamp-2 leading-snug">
                    {dish.name}
                  </h3>

                  <div className="flex justify-between items-end mt-3 mb-2">
                    {/* Giá - Nổi bật nhất, font lớn, màu ấm */}
                    <p className="text-2xl font-bold text-orange-600">
                      {dish.price.toLocaleString("vi-VN")}đ
                    </p>

                    {/* Rating - Đặt cạnh giá, gọn gàng hơn */}
                    <div className="flex items-center gap-1 text-sm">
                      {[...Array(5)].map((_, i) => {
                        const starNumber = i + 1;
                        return dish.rating >= starNumber ? (
                          <FaStar key={i} className="text-yellow-500 w-4 h-4" />
                        ) : dish.rating >= starNumber - 0.5 ? (
                          <FaStarHalf
                            key={i}
                            className="text-yellow-500 w-4 h-4"
                          />
                        ) : (
                          <FaRegStar
                            key={i}
                            className="text-gray-300 w-4 h-4"
                          /> // Dùng FaRegStar (viền) cho ngôi sao rỗng
                        );
                      })}
                      <span className="text-gray-500 font-medium">
                        ({dish.reviews.length})
                      </span>
                    </div>
                  </div>

                  {/* Thông tin phụ: Đã bán */}
                  <p className="text-sm text-gray-500 mt-0.5 border-t border-dashed pt-2">
                    Đã bán {dish.sold?.toLocaleString("vi-VN") ?? 0}+ suất
                  </p>

                  {/* Nút hành động - Đặt món ưu tiên hàng đầu, màu gradient mạnh mẽ hơn */}
                  <Button
                    size="lg"
                    href="#"
                    className="mt-4 w-full font-extrabold text-lg bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-300/50 hover:from-red-600 hover:to-orange-600 transition-all rounded-xl">
                    <FaShoppingCart className="inline mr-2" /> Đặt món ngay
                  </Button>

                  {/* Nút xem chi tiết - Thiết kế tối giản, làm nút phụ */}
                  <Button
                    size="sm"
                    href={`/menu/product/${dish.id}`}
                    className="mt-2 w-full font-semibold !bg-transparent !text-stone-600 hover:!bg-stone-100 transition rounded-xl border border-stone-200">
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </Carousel>
      <a
        href="/menu"
        className="mt-6 inline-flex items-center gap-2 text-yellow-500 font-semibold underline hover:text-orange-500 hover:decoration-2 transition-colors duration-200">
        Xem thêm
        <ChevronRightIcon className="w-5 h-5" />
      </a>
    </section>
  );
}
