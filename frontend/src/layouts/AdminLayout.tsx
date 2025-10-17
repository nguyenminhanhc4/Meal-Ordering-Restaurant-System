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

  const sidebarWidth = isSidebarOpen ? "w-80" : "w-[80px]";

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
            transition-all duration-300 ease-in-out 
            z-40 h-full border-r shadow-lg
          !bg-gray-900 !text-gray-100 
            ${sidebarWidth}
            overflow-y-auto overflow-x-hidden
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
            {isSidebarOpen && <span>Admin Panel</span>}
          </SidebarLogo>

          <SidebarItems>
            <SidebarItemGroup>
              <SidebarItem
                onClick={() => navigate("/admin/dashboard")}
                className="hover:!bg-gray-800 hover:!text-white cursor-pointer text-gray-200"
                icon={HiChartPie}>
                {isSidebarOpen && <span>Dashboard</span>}
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/users")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiUser}>
                {isSidebarOpen && <span>Users</span>}
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/categories")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiCollection}>
                {isSidebarOpen && <span>Categories</span>}
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/menu-items")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiMenuAlt1}>
                {isSidebarOpen && <span>Menu Items</span>}
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/orders")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiShoppingBag}>
                {isSidebarOpen && <span>Orders</span>}
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate("/admin/settings")}
                className="hover:bg-gray-800 hover:text-white cursor-pointer text-gray-200"
                icon={HiCog}>
                {isSidebarOpen && <span>Settings</span>}
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
