import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Navbar,
  Sidebar,
  Dropdown,
  Avatar,
  SidebarLogo,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
  NavbarBrand,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  Button,
  Tooltip,
} from "flowbite-react";
import { useAuth } from "../store/AuthContext";
import {
  HiChartPie,
  HiUser,
  HiCog,
  HiLogout,
  HiCollection,
  HiMenuAlt1,
  HiX,
  HiFolder,
  HiFolderOpen,
  HiMenu,
  HiBell,
} from "react-icons/hi";
import { FaChair } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import logo from "../assets/img/vite.svg";
import "./AdminLayout.css";
import type { NotificationDto } from "../services/types/notification";
import { fetchMyNotifications } from "../services/notification/notificationService";
import { useRealtimeMessage } from "../api/useRealtimeUpdate";

interface SidebarItemButtonProps {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function AdminLayout() {
  const { user, logout, isChecking, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notifications, setNotifications] = useState<NotificationDto[]>([]); // danh sách noti
  const [unreadCount, setUnreadCount] = useState(0); // số thông báo chưa đọc

  const sidebarWidth = isSidebarOpen ? "w-64" : "w-[72px]";

  // ✅ Dùng 1 state tổng để quản lý các menu expand/close
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Orders: true, // mặc định mở "Orders"
  });

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // 🔹 Menu chung cho cả ADMIN và STAFF
  const commonMenu = [
    { path: "/admin/dashboard", label: "Dashboard", icon: HiChartPie },
    {
      label: "Orders",
      icon: HiFolder,
      children: [
        {
          path: "/admin/orders/food",
          label: "Food Orders",
          icon: MdFastfood,
        },
        {
          path: "/admin/orders/tables",
          label: "Table Orders",
          icon: FaChair,
        },
      ],
    },
  ];

  useEffect(() => {
    if (user) {
      fetchMyNotifications()
        .then((data: NotificationDto[]) => {
          setNotifications(data);
          // ✅ Đếm số thông báo chưa đọc
          const unread = data.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch((err) => console.error("Error loading notifications:", err));
    }
  }, [user]);

  useRealtimeMessage<{ type: string; data: NotificationDto }>(
    user ? `/topic/notifications/${user.publicId}` : "",
    (msg) => {
      if (msg.type === "NEW_NOTIFICATION") {
        const newNoti = msg.data;
        setNotifications((prev) => [newNoti, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    }
  );

  useRealtimeMessage<{ type: string; data: NotificationDto }>(
    user ? `/topic/notifications/${user.publicId}` : "",
    (msg) => {
      if (msg.type === "NEW_NOTIFICATION") {
        const newNoti = msg.data;
        setNotifications((prev) => [newNoti, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }

      // ✅ Khi thông báo được đánh dấu là đã đọc
      else if (msg.type === "NOTIFICATION_READ") {
        const updated = msg.data;
        setNotifications((prev) =>
          prev.map((n) => (n.id === updated.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    }
  );

  // 🔹 Menu riêng cho ADMIN
  const adminMenu = [
    { path: "/admin/users", label: "Users", icon: HiUser },
    { path: "/admin/categories", label: "Categories", icon: HiCollection },
    { path: "/admin/menu-items", label: "Menu Items", icon: HiMenuAlt1 },
    { path: "/admin/settings", label: "Settings", icon: HiCog },
  ];

  // 🔹 Menu riêng cho STAFF
  const staffMenu = [
    { path: "/admin/my-tasks", label: "My Tasks", icon: HiCollection },
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang kiểm tra phiên...
      </div>
    );
  }

  if (!isLoggedIn) {
    navigate("/admin/login");
    return null;
  }

  if (!["ADMIN", "STAFF"].includes(user!.role)) {
    navigate("/");
    return null;
  }

  // Component render menu item (để tránh lặp code)
  const SidebarItemButton: React.FC<SidebarItemButtonProps> = ({
    path,
    label,
    icon: Icon,
  }) => {
    const isActive = location.pathname === path;
    return (
      <SidebarItem
        onClick={() => {
          navigate(path);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        className={`
          relative transition-all duration-200 cursor-pointer select-none text-gray-300
          ${
            isActive
              ? "!bg-gray-800 !text-white font-semibold border-l-4 border-blue-500"
              : "hover:!bg-gray-800 hover:!text-white"
          }
        `}>
        <div
          className={`flex items-center ${
            isSidebarOpen
              ? "gap-3 px-3 py-2 justify-start"
              : "justify-center py-3"
          }`}>
          {!isSidebarOpen ? (
            <Tooltip
              content={label}
              placement="right"
              trigger="hover"
              animation="duration-300"
              theme={{
                target: "inline-flex",
                base: "absolute z-10 inline-block text-sm transition-opacity duration-300",
                style: {
                  dark: "!bg-blue-600 !text-white",
                  light: "!bg-blue-600 !text-white",
                },
                arrow: {
                  style: {
                    dark: "!bg-blue-600",
                    light: "!bg-blue-600",
                  },
                },
              }}>
              <div>
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
            </Tooltip>
          ) : (
            <Icon className="w-5 h-5 flex-shrink-0" />
          )}
          {isSidebarOpen && (
            <span className="truncate text-sm leading-none">{label}</span>
          )}
        </div>
      </SidebarItem>
    );
  };

  return (
    <section className="admin-layout">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}></div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          aria-label="Sidebar"
          className={`
            flex-shrink-0 transition-all duration-300 ease-in-out 
            z-[60] h-full border-r shadow-lg
            ${sidebarWidth}
          `}
          theme={{
            root: {
              inner:
                "h-full !bg-gray-900 !text-gray-100 relative !overflow-visible",
              base: "h-full relative !rounded-l-none",
            },
            item: {
              base: "hover:!bg-gray-800 hover:!text-white cursor-pointer text-gray-200",
            },
          }}>
          {/* Nút đóng Sidebar (mobile) */}
          <div className="flex justify-end p-2 md:hidden">
            <Button
              color="gray"
              onClick={toggleSidebar}
              className="!bg-transparent !border-none !text-white">
              <HiX className="w-6 h-6" />
            </Button>
          </div>

          {/* Logo */}
          <SidebarLogo
            href="/admin/dashboard"
            img={`${logo}`}
            imgAlt="Logo"
            className={`!text-white flex items-center py-3 ${
              isSidebarOpen ? "px-4" : "justify-center"
            }`}>
            {isSidebarOpen && (
              <span className="ml-2 text-lg font-semibold tracking-wide">
                Admin Panel
              </span>
            )}
          </SidebarLogo>

          {/* Sidebar content */}
          <SidebarItems>
            {/* 🔹 Menu chung */}
            <SidebarItemGroup>
              <h6
                className={`${
                  isSidebarOpen ? "px-3 mb-1" : "hidden"
                } text-xs uppercase tracking-wide text-gray-400`}>
                Chung
              </h6>

              {(() => {
                return commonMenu.map((item) => {
                  // Nếu có children (ví dụ: Orders)
                  if (item.children) {
                    const isExpanded = expandedMenus[item.label];

                    return (
                      <div key={item.label}>
                        {/* Nút nhóm cha */}
                        <SidebarItem
                          onClick={() => {
                            if (isSidebarOpen) toggleExpand(item.label);
                          }}
                          className={`relative transition-all duration-200 cursor-pointer select-none text-gray-300 ${
                            isExpanded
                              ? "!text-white"
                              : "hover:!bg-gray-800 hover:!text-white"
                          }`}>
                          <div
                            className={`flex items-center justify-between ${
                              isSidebarOpen
                                ? "gap-3 px-3 py-2 justify-start"
                                : "justify-center py-3"
                            }`}>
                            {!isSidebarOpen ? (
                              <Tooltip
                                content={item.label}
                                placement="right"
                                trigger="hover"
                                animation="duration-300"
                                theme={{
                                  target: "inline-flex",
                                  base: "absolute z-10 inline-block text-sm transition-opacity duration-300",
                                  style: {
                                    dark: "!bg-blue-600 !text-white",
                                    light: "!bg-blue-600 !text-white",
                                  },
                                  arrow: {
                                    style: {
                                      dark: "!bg-blue-600",
                                      light: "!bg-blue-600",
                                    },
                                  },
                                }}>
                                <div>
                                  <item.icon className="w-5 h-5 flex-shrink-0" />
                                </div>
                              </Tooltip>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <HiFolderOpen className="w-5 h-5 flex-shrink-0 text-blue-400" />
                                  ) : (
                                    <HiFolder className="w-5 h-5 flex-shrink-0" />
                                  )}
                                  <span className="truncate text-sm leading-none">
                                    {item.label}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </SidebarItem>

                        {/* Các mục con */}
                        {isSidebarOpen && isExpanded && (
                          <div className="ml-4 border-l border-gray-700">
                            {item.children.map((sub) => (
                              <SidebarItemButton key={sub.path} {...sub} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Nếu là menu đơn
                  return <SidebarItemButton key={item.path} {...item} />;
                });
              })()}
            </SidebarItemGroup>

            {/* <hr className="my-2 border-gray-700" /> */}

            {/* 🔹 Menu riêng ADMIN */}
            {user?.role === "ADMIN" && (
              <SidebarItemGroup>
                <h6
                  className={`${
                    isSidebarOpen ? "px-3 mb-1" : "hidden"
                  } text-xs uppercase tracking-wide text-gray-400`}>
                  Quản trị hệ thống
                </h6>
                {adminMenu.map((item) => (
                  <SidebarItemButton key={item.path} {...item} />
                ))}
              </SidebarItemGroup>
            )}

            {/* 🔹 Menu riêng STAFF */}
            {user?.role === "STAFF" && (
              <SidebarItemGroup>
                <h6
                  className={`${
                    isSidebarOpen ? "px-3 mb-1" : "hidden"
                  } text-xs uppercase tracking-wide text-gray-400`}>
                  Tác vụ nhân viên
                </h6>
                {staffMenu.map((item) => (
                  <SidebarItemButton key={item.path} {...item} />
                ))}
              </SidebarItemGroup>
            )}
          </SidebarItems>
        </Sidebar>

        {/* Content area */}
        <div className="flex flex-col flex-1">
          {/* Navbar */}
          <Navbar
            fluid
            className="border-b !border-gray-200 !bg-white shadow-sm">
            <div className="flex items-center">
              <Button
                onClick={toggleSidebar}
                color="gray"
                className="mr-3 p-2 !bg-transparent !border-none text-gray-600 hover:!bg-gray-100">
                <HiMenu className="w-6 h-6" />
              </Button>

              <NavbarBrand>
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-800">
                  {user?.name || "Admin"}
                </span>
              </NavbarBrand>
            </div>

            <div className="flex items-center gap-3 md:order-2">
              {/* 🔔 Notification */}
              <div className="relative">
                <Tooltip content="Thông báo" placement="bottom">
                  <button
                    onClick={() => {
                      navigate("/admin/notifications");
                      // ✅ Reset badge nếu bạn muốn "xem" là đã đọc
                      // markAllAsRead(); // bật nếu muốn
                    }}
                    className="relative p-1 rounded hover:bg-gray-100">
                    <HiBell className="w-6 h-6 text-yellow-400 hover:text-yellow-600" />
                    {unreadCount > 0 && (
                      <span
                        className="
            absolute -top-1 -right-1 
            text-[11px] font-semibold w-4 h-4 
            bg-red-500 text-white rounded-full 
            flex items-center justify-center
          ">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>
              </div>

              <Dropdown
                inline
                label={
                  <Avatar
                    alt="Admin avatar"
                    img={user?.avatarUrl || logo}
                    rounded
                  />
                }>
                <DropdownHeader>
                  <span className="block text-sm">{user?.name}</span>
                  <span className="block truncate text-sm font-medium">
                    {user?.email}
                  </span>
                </DropdownHeader>
                <DropdownItem as={Link} to="/admin/settings">
                  Cài đặt
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  icon={HiLogout}
                  onClick={async () => {
                    await logout();
                    navigate("/admin/login");
                  }}>
                  Đăng xuất
                </DropdownItem>
              </Dropdown>
            </div>
          </Navbar>

          {/* Main content */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;
