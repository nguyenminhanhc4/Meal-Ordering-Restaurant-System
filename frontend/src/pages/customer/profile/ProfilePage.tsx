import React, { useState } from "react";
import UserProfileContent from "../../../components/profile/UserProfileContent";
// 🚨 Thay thế import từ lucide-react sang react-icons/hi
import {
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineLockClosed,
} from "react-icons/hi";

// Dữ liệu các tab Sidebar
const profileTabs = [
  {
    id: "profile",
    label: "Thông tin cá nhân",
    // 🚨 Thay thế icon
    icon: HiOutlineUser,
    component: UserProfileContent,
  },
  {
    id: "orders",
    label: "Lịch sử đặt món",
    // 🚨 Thay thế icon (dùng HiOutlineClock cho lịch sử)
    icon: HiOutlineClock,
    component: () => (
      <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
        Nội dung Lịch sử đặt món (Chưa làm)
      </div>
    ),
  },
  {
    id: "reservations",
    label: "Lịch sử đặt bàn",
    // 🚨 Thay thế icon (có thể dùng lại HiOutlineClock hoặc icon bàn ăn nếu có)
    icon: HiOutlineClock,
    component: () => (
      <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
        Nội dung Lịch sử đặt bàn (Chưa làm)
      </div>
    ),
  },
  {
    id: "security",
    label: "Bảo mật & Mật khẩu",
    // 🚨 Thay thế icon
    icon: HiOutlineLockClosed,
    component: () => (
      <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
        Nội dung Bảo mật (Chưa làm)
      </div>
    ),
  },
];

// Component cho liên kết Sidebar (Giữ nguyên)
interface SidebarLinkProps {
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  label,
  Icon,
  isActive,
  onClick,
}) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition duration-150 text-base font-medium
        ${
          isActive
            ? "bg-blue-500 text-white shadow-md shadow-blue-500/40"
            : "text-gray-700 hover:bg-gray-100"
        }`}>
      {/* Icon đã được truyền vào dưới dạng Component và được render ở đây */}
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  </li>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(profileTabs[0].id);
  const ActiveComponent =
    profileTabs.find((tab) => tab.id === activeTab)?.component || (() => null);

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Cài đặt Tài khoản
          </h1>

          {/* Bố cục chính: Sidebar và Nội dung */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar (Thanh Điều Hướng) */}
            <nav className="flex-shrink-0 w-full lg:w-72">
              <div className="bg-white rounded-3xl shadow-2xl p-4 sticky top-20 border border-blue-800">
                <ul className="space-y-1">
                  {profileTabs.map((tab) => (
                    <SidebarLink
                      key={tab.id}
                      label={tab.label}
                      Icon={tab.icon}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}
                </ul>
              </div>
            </nav>

            {/* Nội dung chính */}
            <main className="flex-grow min-w-0">
              <ActiveComponent />
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
