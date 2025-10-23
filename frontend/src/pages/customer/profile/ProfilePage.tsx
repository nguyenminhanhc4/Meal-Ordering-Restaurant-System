import React, { useState } from "react";
import UserProfileContent from "../../../components/profile/UserProfileContent";
import UserReservationHistory from "../../../components/profile/UserReservationHistory";
import UserSecuritySettings from "../../../components/profile/UserSecuritySettings";
import OrderHistoryPage from "../../../components/profile/OrderHistoryPage";
import NotificationList from "../../../components/Notification/NotificationList.tsx";
import {
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineLockClosed,
  HiOutlineBell,
} from "react-icons/hi";

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
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  </li>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  const profileTabs = [
    {
      id: "profile",
      label: "Thông tin cá nhân",
      icon: HiOutlineUser,
      component: UserProfileContent,
    },
    {
      id: "orders",
      label: "Lịch sử đặt món",
      icon: HiOutlineClock,
      component: OrderHistoryPage,
    },
    {
      id: "reservations",
      label: "Lịch sử đặt bàn",
      icon: HiOutlineClock,
      component: UserReservationHistory,
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: HiOutlineBell,
      component: NotificationList,
    },
    {
      id: "security",
      label: "Bảo mật & Mật khẩu",
      icon: HiOutlineLockClosed,
      component: UserSecuritySettings,
    },
  ];

  const ActiveComponent =
    profileTabs.find((tab) => tab.id === activeTab)?.component || (() => null);

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row gap-8 py-12 px-4 md:px-6">
        {/* Sidebar */}
        <nav className="flex-shrink-0 w-full lg:w-72">
          <div className="bg-white rounded-3xl shadow-2xl p-4 sticky top-20 border border-blue-800">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold text-blue-800 uppercase tracking-wide">
                Hồ sơ người dùng
              </h2>
              <div className="mt-2 h-[2px] bg-blue-800 mx-auto rounded-full"></div>
            </div>
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

        {/* Main content */}
        <main className="flex-grow min-w-0">
          <ActiveComponent />
        </main>
      </div>
    </section>
  );
}
