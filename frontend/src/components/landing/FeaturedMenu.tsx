import {
  Carousel,
  Card,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "flowbite-react";
import { useEffect, useState } from "react";
import beefSteak from "../../assets/temp/beef_steak.jpg";
import pizzaSeafood from "../../assets/temp/pizza_seafood.jpg";
import sushiCombo from "../../assets/temp/sushi_combo.jpg";
import saladFruit from "../../assets/temp/salad_fruit.jpg";
import carbonaraPasta from "../../assets/temp/carbonara_pasta.jpg";

export default function FeaturedMenu() {
  const featuredDishes = [
    { name: "Steak Bò", img: beefSteak, price: "250.000đ" },
    { name: "Pizza Hải Sản", img: pizzaSeafood, price: "180.000đ" },
    { name: "Sushi Combo", img: sushiCombo, price: "220.000đ" },
    { name: "Salad Trái Cây", img: saladFruit, price: "120.000đ" },
    { name: "Mì Ý Carbonara", img: carbonaraPasta, price: "150.000đ" },
  ];

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const getSlidesCount = () => {
    if (window.innerWidth >= 1024) return 3; // large screens
    if (window.innerWidth >= 640) return 2; // medium screens
    return 1; // small screens
  };

  const [slidesCount, setSlidesCount] = useState(getSlidesCount());
  const [chunkedDishes, setChunkedDishes] = useState(
    chunkArray(featuredDishes, slidesCount)
  );

  useEffect(() => {
    const handleResize = () => {
      const count = getSlidesCount();
      setSlidesCount(count);
      setChunkedDishes(chunkArray(featuredDishes, count));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            {group.map((dish, index) => (
              <Card
                key={index}
                className="flex-1 min-w-[250px] max-w-sm w-full mx-auto !bg-amber-100 border !border-amber-200 shadow-lg rounded-xl hover:scale-105 transition-transform duration-300">
                <img
                  src={dish.img}
                  alt={dish.name}
                  className="rounded-t-xl object-cover h-64 w-full"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-stone-800">
                    {dish.name}
                  </h3>
                  <p className="text-amber-700 font-bold mt-2">{dish.price}</p>
                  <Button
                    size="lg"
                    href="#"
                    className="mt-4 w-full font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-stone-800 shadow-md hover:opacity-90 transition">
                    Đặt món
                  </Button>
                  <Button
                    size="sm"
                    href="#"
                    className="mt-2 w-full font-semibold !bg-stone-200 !text-stone-800 shadow-sm hover:bg-stone-300 transition">
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </Carousel>
      <a
        href="#"
        className="mt-6 inline-flex items-center gap-2 text-yellow-500 font-semibold underline hover:text-orange-500 hover:decoration-2 transition-colors duration-200">
        Xem thêm
        <ChevronRightIcon className="w-5 h-5" />
      </a>
    </section>
  );
}
