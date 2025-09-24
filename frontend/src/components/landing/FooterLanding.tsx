import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function FooterLanding() {
  return (
    <footer className="bg-stone-800 text-gray-200 py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Thông tin nhà hàng */}
        <div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            XYZ Restaurant
          </h2>
          <p className="text-sm">123 Đường ABC, Quận 1, TP.HCM</p>
          <p className="text-sm mt-1">+84 123 456 789</p>
          <p className="text-sm mt-1">contact@xyzrestaurant.com</p>
        </div>

        {/* Menu nhanh / Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-yellow-400 transition-colors">
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="/menu"
                className="hover:text-yellow-400 transition-colors">
                Thực đơn
              </a>
            </li>
            <li>
              <a
                href="/booking"
                className="hover:text-yellow-400 transition-colors">
                Đặt bàn
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-yellow-400 transition-colors">
                Giới thiệu
              </a>
            </li>
          </ul>
        </div>

        {/* Giờ mở cửa */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Giờ mở cửa</h3>
          <p>Thứ 2 – Chủ nhật: 9:00 – 22:00</p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Kết nối với chúng tôi</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <FaFacebookF size={20} />
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <FaYoutube size={20} />
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <FaTiktok size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-stone-700 pt-4 text-center text-sm text-gray-400">
        © 2025 XYZ Restaurant. All rights reserved.
      </div>
    </footer>
  );
}
