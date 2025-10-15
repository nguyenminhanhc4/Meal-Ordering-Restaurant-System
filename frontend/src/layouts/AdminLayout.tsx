import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
} from "flowbite-react";
import { useAuth } from "../store/AuthContext";
import {
  HiChartPie,
  HiUser,
  HiShoppingBag,
  HiCog,
  HiLogout,
  HiCollection,
  HiMenuAlt1,
  HiX,
} from "react-icons/hi";
import logo from "../assets/img/vite.svg";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout, isChecking, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  if (user?.role !== "ADMIN") {
    navigate("/");
    return null;
  }

  // -------------------- LOGIC CSS CẢI TIẾN --------------------
  const mobileSidebarClasses = isSidebarOpen
    ? "fixed inset-y-0 left-0 translate-x-0" // Mở trên mobile
    : "fixed inset-y-0 left-0 -translate-x-full"; // Ẩn hoàn toàn trên mobile

  // Desktop
  const desktopSidebarClasses = isSidebarOpen
    ? "relative w-80" // Mở trên desktop
    : "relative w-[72px]"; // Thu gọn trên desktop (chỉ hiện icon)
  // -----------------------------------------------------------
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
          flex-shrink-0 
          transition-all 
          duration-300 
          ease-in-out 
          z-40 
          h-full 
          border-r shadow-lg 
          !bg-gray-900 !text-gray-100 
          ${mobileSidebarClasses} /* Mobile */
          ${desktopSidebarClasses} /* Desktop */
          overflow-y-auto /* Quan trọng để cuộn */
          overflow-x-hidden /* Quan trọng để tránh thanh cuộn ngang */
        `}
          theme={{
            root: {
              inner: "h-full !bg-gray-900 !text-gray-100",
              base: "h-full",
            },
            item: {
              base: "hover:!bg-gray-800 hover:!text-white cursor-pointer text-gray-200",
            },
          }}>
          {/* Nút đóng Sidebar trên mobile */}
          <div className="flex justify-end p-2 md:hidden">
            <Button
              color="gray"
              onClick={toggleSidebar}
              className="!bg-transparent !border-none !text-white">
              <HiX className="w-6 h-6" />
            </Button>
          </div>

          <SidebarLogo
            href="/admin/dashboard"
            img={`${logo}`}
            imgAlt="Logo"
            className="!text-white">
            Admin Panel
          </SidebarLogo>

          <SidebarItems>
            <SidebarItemGroup>
              <SidebarItem
                onClick={() => navigate("/admin/dashboard")}
                className="hover:!bg-gray-800 hover:!text-white cursor-pointer text-gray-200"
                icon={HiChartPie}>
                Dashboard
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/users")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiUser}>
                Users
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/categories")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiCollection}>
                Categories
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/menu-items")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiMenuAlt1}>
                Menu Items
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/orders")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiShoppingBag}>
                Orders
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/settings")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiCog}>
                Settings
              </SidebarItem>
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>

        {/* Content area */}
        <div className="flex flex-col flex-1">
          {/* Navbar */}
          <Navbar
            fluid
            className="border-b !border-gray-200 !bg-white shadow-sm">
            {/* NÚT HAMBURGER MỚI */}
            <div className="flex items-center">
              <Button
                onClick={toggleSidebar}
                color="gray"
                className="mr-3 p-2 !bg-transparent !border-none text-gray-600 hover:!bg-gray-100">
                <HiMenuAlt1 className="w-6 h-6" />
              </Button>

              <NavbarBrand>
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-800">
                  {user?.name || "Admin"}
                </span>
              </NavbarBrand>
            </div>

            <div className="flex md:order-2">
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

          {/* Main Content */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;
