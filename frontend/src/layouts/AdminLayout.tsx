import { Outlet, Link, useNavigate } from "react-router-dom";
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
} from "flowbite-react";
import { useAuth } from "../store/AuthContext";
import {
  HiChartPie,
  HiUser,
  HiShoppingBag,
  HiCog,
  HiLogout,
} from "react-icons/hi";
import logo from "../assets/img/vite.svg";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout, isChecking, isLoggedIn } = useAuth();
  const navigate = useNavigate();

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
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          aria-label="Sidebar"
          className="w-80 admin-sidebar border-r shadow-lg">
          <SidebarLogo href="/admin/dashboard" img={`${logo}`} imgAlt="Logo">
            Admin Panel
          </SidebarLogo>
          <SidebarItems>
            <SidebarItemGroup>
              <SidebarItem
                onClick={() => navigate('/admin/dashboard')}
                className="hover:bg-gray-800 text-gray-200 hover:text-white cursor-pointer"
                icon={HiChartPie}>
                Dashboard
              </SidebarItem>
              <SidebarItem
                onClick={() => navigate('/admin/users')}
                className="cursor-pointer"
                icon={HiUser}>
                Users
              </SidebarItem>
              <SidebarItem
                onClick={() => navigate('/admin/orders')}
                className="cursor-pointer"
                icon={HiShoppingBag}>
                Orders
              </SidebarItem>
              <SidebarItem
                onClick={() => navigate('/admin/settings')}
                className="cursor-pointer"
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
            <NavbarBrand>
              <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-800">
                {user?.name || "Admin"}
              </span>
            </NavbarBrand>
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
