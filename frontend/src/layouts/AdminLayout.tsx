import { useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

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
  DropdownItem,
  DropdownDivider,
  Button,
  Tooltip,
} from "flowbite-react";

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
  HiOutlineViewGrid,
} from "react-icons/hi";
import { FaChair } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";

import logo from "../assets/img/vite.svg";
import "./AdminLayout.css";

import { useAuth } from "../store/AuthContext";
import { useRealtimeMessage } from "../api/useRealtimeUpdate";
import NotificationBell from "../components/bell/NotificationBell";
import LanguageSelector from "../components/LanguageSelector";

import { useTranslation } from "react-i18next";

import type { NotificationDto } from "../services/types/notification";

/* --------------------------------- INTERFACES --------------------------------- */
interface SidebarItemButtonProps {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/* --------------------------------- COMPONENT ---------------------------------- */
function AdminLayout() {
  /* ----------------------------- 🔹 HOOKS & CONTEXT ----------------------------- */
  const { t } = useTranslation();
  const { user, logout, isChecking, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ------------------------------- 🔹 STATE HOOKS ------------------------------- */
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Orders: true, // mở mặc định
  });
  const [, setNotifications] = useState<NotificationDto[]>([]);
  const [, setUnreadCount] = useState(0);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* --------------------------------- HANDLERS ---------------------------------- */
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLangClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const sidebarWidth = isSidebarOpen ? "w-64" : "w-[72px]";

  /* -------------------------- 🔹 REALTIME NOTIFICATIONS -------------------------- */
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
      } else if (msg.type === "NOTIFICATION_READ") {
        const updated = msg.data;
        setNotifications((prev) =>
          prev.map((n) => (n.id === updated.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    }
  );

  /* --------------------------------- 🔹 MENUS ---------------------------------- */
  const commonMenu = [
    {
      path: "/admin/dashboard",
      label: t("admin.sidebar.menu.dashboard"),
      icon: HiChartPie,
    },
    {
      path: "/admin/tables",
      label: t("admin.sidebar.menu.tables"),
      icon: HiOutlineViewGrid,
    },
    {
      path: "/admin/ingredients",
      label: t("admin.sidebar.menu.ingredients"),
      icon: HiOutlineViewGrid,
    },
    {
      label: t("admin.sidebar.menu.orders"),
      icon: HiFolder,
      children: [
        {
          path: "/admin/orders/food",
          label: t("admin.sidebar.menu.foodOrders"),
          icon: MdFastfood,
        },
        {
          path: "/admin/orders/tables",
          label: t("admin.sidebar.menu.tableOrders"),
          icon: FaChair,
        },
      ],
    },
  ];

  const adminMenu = [
    {
      path: "/admin/users",
      label: t("admin.sidebar.menu.users"),
      icon: HiUser,
    },
    {
      path: "/admin/categories",
      label: t("admin.sidebar.menu.categories"),
      icon: HiCollection,
    },
    {
      path: "/admin/menu-items",
      label: t("admin.sidebar.menu.menuItems"),
      icon: HiMenuAlt1,
    },
    {
      path: "/admin/settings",
      label: t("admin.sidebar.menu.settings"),
      icon: HiCog,
    },
  ];

  const staffMenu = [
    {
      path: "/admin/my-tasks",
      label: t("admin.sidebar.menu.myTasks"),
      icon: HiCollection,
    },
  ];

  /* ---------------------------- 🔹 ACCESS CONTROL ---------------------------- */
  if (isChecking)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        {t("admin.checkingSession")}
      </div>
    );

  if (!isLoggedIn) {
    navigate("/admin/login");
    return null;
  }

  if (!["ADMIN", "STAFF"].includes(user!.role)) {
    navigate("/");
    return null;
  }

  /* -------------------------- 🔹 SIDEBAR ITEM BUTTON -------------------------- */
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
        className={`relative transition-all duration-200 cursor-pointer select-none text-gray-300
          ${
            isActive
              ? "!bg-gray-800 !text-white font-semibold border-l-4 border-blue-500"
              : "hover:!bg-gray-800 hover:!text-white"
          }`}>
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
              animation="duration-300"
              theme={{
                target: "inline-flex",
                base: "absolute z-10 inline-block text-sm transition-opacity duration-300",
                style: {
                  dark: "!bg-blue-600 !text-white",
                  light: "!bg-blue-600 !text-white",
                },
                arrow: {
                  style: { dark: "!bg-blue-600", light: "!bg-blue-600" },
                },
              }}>
              <div>
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
            </Tooltip>
          ) : (
            <>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate text-sm leading-none">{label}</span>
            </>
          )}
        </div>
      </SidebarItem>
    );
  };

  /* ----------------------------------- JSX ----------------------------------- */
  return (
    <section className="admin-layout">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex flex-1">
        {/* ------------------------------ SIDEBAR ------------------------------ */}
        <Sidebar
          aria-label="Sidebar"
          className={`flex-shrink-0 transition-all duration-300 ease-in-out z-[60] h-full border-r shadow-lg ${sidebarWidth}`}
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
          {/* Close button for mobile */}
          <div className="flex justify-end p-2 md:hidden">
            <Button
              color="gray"
              onClick={toggleSidebar}
              className="!bg-transparent !text-white">
              <HiX className="w-6 h-6" />
            </Button>
          </div>

          {/* Logo */}
          <SidebarLogo
            href="/admin/dashboard"
            img={logo}
            imgAlt={t("component.megaMenu.logoAlt")}
            className={`!text-white flex items-center py-3 ${
              isSidebarOpen ? "px-4" : "justify-center"
            }`}>
            {isSidebarOpen && (
              <span className="ml-2 text-lg font-semibold tracking-wide">
                {t("admin.sidebar.logo")}
              </span>
            )}
          </SidebarLogo>

          {/* Sidebar content */}
          <SidebarItems>
            {/* Common group */}
            <SidebarItemGroup>
              {isSidebarOpen && (
                <h6 className="px-3 mb-1 text-xs uppercase tracking-wide text-gray-400">
                  {t("admin.sidebar.commonGroup")}
                </h6>
              )}
              {commonMenu.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      if (!isSidebarOpen) {
                        if (hoverTimer.current !== null) {
                          clearTimeout(hoverTimer.current);
                        }
                        setHoveredMenu(item.label);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isSidebarOpen) {
                        hoverTimer.current = setTimeout(
                          () => setHoveredMenu(null),
                          300
                        );
                      }
                    }}>
                    <SidebarItem
                      onClick={() => isSidebarOpen && toggleExpand(item.label)}
                      className={`relative transition-all duration-200 cursor-pointer text-gray-300 ${
                        expandedMenus[item.label]
                          ? "!text-white"
                          : "hover:!bg-gray-800 hover:!text-white"
                      }`}>
                      <div
                        className={`flex items-center ${
                          isSidebarOpen
                            ? "gap-3 px-3 py-2"
                            : "justify-center py-3"
                        }`}>
                        {!isSidebarOpen ? (
                          <>
                            <Tooltip
                              content={item.label}
                              placement="right"
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

                            {/* Popup submenu */}
                            {hoveredMenu === item.label && (
                              <div
                                className="absolute left-full top-0 ml-2 bg-gray-900 border border-gray-700 text-white shadow-xl rounded-lg py-2 px-3 z-50 min-w-[220px] animate-fadeIn"
                                onMouseEnter={() => {
                                  if (hoverTimer.current !== null) {
                                    clearTimeout(hoverTimer.current);
                                  }
                                  setHoveredMenu(item.label);
                                }}
                                onMouseLeave={() => {
                                  hoverTimer.current = setTimeout(
                                    () => setHoveredMenu(null),
                                    300
                                  );
                                }}>
                                {/* Header group */}
                                <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-1">
                                  <item.icon className="w-5 h-5 text-blue-400" />
                                  <span className="font-medium text-sm tracking-wide">
                                    {item.label}
                                  </span>
                                </div>

                                {/* List submenu */}
                                <div className="flex flex-col gap-1">
                                  {item.children.map((sub) => (
                                    <div
                                      key={sub.path}
                                      onClick={() => navigate(sub.path)}
                                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150 ${
                                        location.pathname === sub.path
                                          ? "bg-blue-600 text-white"
                                          : "hover:bg-gray-800 hover:text-white text-gray-300"
                                      }`}>
                                      {sub.icon && (
                                        <sub.icon className="w-4 h-4 flex-shrink-0" />
                                      )}
                                      <span className="text-sm truncate">
                                        {sub.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-3">
                            {expandedMenus[item.label] ? (
                              <HiFolderOpen className="w-5 h-5 flex-shrink-0 text-blue-400" />
                            ) : (
                              <HiFolder className="w-5 h-5 flex-shrink-0" />
                            )}
                            <span className="truncate text-sm leading-none">
                              {item.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </SidebarItem>

                    {isSidebarOpen && expandedMenus[item.label] && (
                      <div className="ml-4 border-l border-gray-700">
                        {item.children.map((sub) => (
                          <SidebarItemButton key={sub.path} {...sub} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <SidebarItemButton key={item.path} {...item} />
                )
              )}
            </SidebarItemGroup>

            {/* Admin group */}
            {user?.role === "ADMIN" && (
              <SidebarItemGroup>
                {isSidebarOpen && (
                  <h6 className="px-3 mb-1 text-xs uppercase tracking-wide text-gray-400">
                    {t("admin.sidebar.adminGroup")}
                  </h6>
                )}
                {adminMenu.map((item) => (
                  <SidebarItemButton key={item.path} {...item} />
                ))}
              </SidebarItemGroup>
            )}

            {/* Staff group */}
            {user?.role === "STAFF" && (
              <SidebarItemGroup>
                {isSidebarOpen && (
                  <h6 className="px-3 mb-1 text-xs uppercase tracking-wide text-gray-400">
                    {t("admin.sidebar.staffGroup")}
                  </h6>
                )}
                {staffMenu.map((item) => (
                  <SidebarItemButton key={item.path} {...item} />
                ))}
              </SidebarItemGroup>
            )}
          </SidebarItems>
        </Sidebar>

        {/* ------------------------------ MAIN CONTENT ------------------------------ */}
        <div className="flex flex-col flex-1">
          <Navbar
            fluid
            className="border-b !border-gray-200 !bg-white shadow-sm">
            {/* Left */}
            <div className="flex items-center">
              <Button
                onClick={toggleSidebar}
                color="gray"
                className="mr-3 p-2 !bg-transparent !border-none text-gray-600 hover:!bg-gray-100">
                <HiMenu className="w-6 h-6" />
              </Button>
              <NavbarBrand>
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-800">
                  {user?.name || t("admin.navbar.defaultName")}
                </span>
              </NavbarBrand>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 md:order-2">
              <NotificationBell
                bgColor="!bg-blue-600"
                hoverColor="hover:!bg-blue-500"
                iconColor="text-white"
                badgeColor="failure"
                redirectTo="/admin/notifications"
              />
              <Dropdown
                inline
                label={
                  <Avatar
                    alt={t("component.megaMenu.userAvatarAlt")}
                    img={user?.avatarUrl || logo}
                    rounded
                  />
                }
                className="!bg-gray-900 !border-gray-700 !text-gray-200 shadow-lg"
                theme={{
                  floating: {
                    base: "!bg-gray-900 !text-gray-200 !border-gray-700 shadow-xl rounded-xl overflow-hidden w-64",
                    item: {
                      base: "flex w-full cursor-pointer items-center justify-start gap-2 px-4 py-2 text-sm text-gray-300 hover:!bg-gray-800 hover:!text-white transition-colors",
                    },
                    header:
                      "!bg-gray-900 text-gray-400 border-b border-gray-700",
                    divider: "border-gray-700",
                  },
                }}>
                {/* Header - Avatar + Info */}
                <div className="flex flex-col items-center py-4 px-3 text-center">
                  <Avatar
                    size="xl"
                    img={user?.avatarUrl || logo}
                    rounded
                    bordered
                    color="gray"
                    className="mb-2 ring-2 ring-gray-700"
                  />
                  <span className="block text-sm font-semibold text-gray-100">
                    {user?.name}
                  </span>
                  <span className="block text-xs text-gray-400 truncate max-w-[200px]">
                    {user?.email}
                  </span>
                </div>

                <DropdownDivider />

                {/* Language Selector */}
                <div
                  className="flex items-center justify-center gap-2 py-3"
                  onClick={handleLangClick as unknown as () => void}>
                  <LanguageSelector
                    compact
                    accentColor="text-blue-400"
                    hoverColor="hover:text-white"
                    activeBg="bg-blue-700 border-blue-900 border-4"
                    inactiveText="text-gray-400 border-blue-900 border-4"
                    labelColor="text-gray-200"
                  />
                </div>

                <DropdownDivider />

                {/* Logout Button */}
                <DropdownItem
                  icon={HiLogout}
                  className="hover:!bg-red-600 hover:!text-white !text-gray-300 transition-colors font-medium justify-center"
                  onClick={async () => {
                    await logout();
                    navigate("/admin/login");
                  }}>
                  {t("component.megaMenu.logout")}
                </DropdownItem>
              </Dropdown>
            </div>
          </Navbar>

          {/* Outlet */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;
