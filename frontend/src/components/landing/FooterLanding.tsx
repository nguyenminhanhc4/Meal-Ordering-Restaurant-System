import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function FooterLanding() {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-800 text-gray-200 py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Thông tin nhà hàng */}
        <div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            XYZ Restaurant
          </h2>
          <p className="text-sm">{t("footer.address")}</p>
          <p className="text-sm mt-1">{t("footer.phone")}</p>
          <p className="text-sm mt-1">{t("footer.email")}</p>
        </div>

        {/* Menu nhanh / Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-yellow-400 transition-colors">
                {t("footer.home")}
              </a>
            </li>
            <li>
              <a
                href="/menu"
                className="hover:text-yellow-400 transition-colors">
                {t("footer.menu")}
              </a>
            </li>
            <li>
              <a
                href="/table"
                className="hover:text-yellow-400 transition-colors">
                {t("footer.reserveTable")}
              </a>
            </li>
          </ul>
        </div>

        {/* Giờ mở cửa */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("footer.openingHours")}
          </h3>
          <p>{t("footer.workingTime")}</p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("footer.connectWithUs")}
          </h3>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors">
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://www.instagram.com/accounts/login/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors">
              <FaInstagram size={20} />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors">
              <FaYoutube size={20} />
            </a>
            <a
              href="https://www.tiktok.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors">
              <FaTiktok size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-stone-700 pt-4 text-center text-sm text-gray-400">
        © 2025 XYZ Restaurant. {t("footer.copyright")}
      </div>
    </footer>
  );
}
