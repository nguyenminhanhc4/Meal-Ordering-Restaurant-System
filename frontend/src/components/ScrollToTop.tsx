import { useEffect, useState } from "react";
import { HiChevronUp } from "react-icons/hi"; // hoặc dùng icon từ react-icons

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-amber-900 text-white shadow-lg hover:bg-amber-700 transition-all duration-300 z-50">
          <HiChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
