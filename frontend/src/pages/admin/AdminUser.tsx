import { useEffect, useState, useCallback } from "react";
import {
  Button,
  TextInput,
  Card,
  Avatar,
  Badge,
  Select,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableHeadCell,
} from "flowbite-react";
import { HiSearch, HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";
import { UserFormModal } from "../../components/user/UserFormModal";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";

interface User {
  id: number;
  publicId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  roleId: number;
  statusId: number;
  gender?: string;
}

export const AdminUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // State for search/filter inputs
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [roles, setRoles] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 15;
  const { notify } = useNotification();

  // --- 1. FUNCTION TO FETCH USERS (GỬI SEARCH & FILTER LÊN BACKEND) ---
  const fetchUsers = useCallback(
    async (
      page: number,
      size: number,
      keyword: string,
      roleId: string, // ID vai trò dưới dạng string
      signal: AbortSignal
    ) => {
      setLoading(true);
      try {
        const response = await api.get("/users", {
          signal,
          params: {
            page: page - 1, // Spring page is 0-based
            size: size,
            sort: "id,desc",
            // Gửi keyword và roleId lên backend
            keyword: keyword.trim() || undefined,
            roleId: roleId || undefined,
          },
        });

        const result = response.data?.data;
        if (result) {
          const newUsers = result.data || [];
          const metadata = result.metadata;

          setUsers(newUsers);
          setTotalPages(metadata?.totalPages ?? 1);
          setTotalItems(metadata?.total ?? 0);
        } else {
          setUsers([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Fetch users error:", error);
          notify("error", "Could not load users. Please try again later.");
          setUsers([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [notify]
  );
  // ------------------------------------------------------------------

  // --- 2. useEffect (RERUN KHI CÓ THAY ĐỔI) ---
  useEffect(() => {
    const abortController = new AbortController();

    // Tải Roles chỉ 1 lần
    const loadRoles = async (signal: AbortSignal) => {
      try {
        const rolesResponse = await api.get("/params?type=ROLE", { signal });
        if (rolesResponse.data && rolesResponse.data.data) {
          setRoles(rolesResponse.data.data);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (!signal.aborted) {
          notify("error", "Could not load roles.");
        }
      }
    };

    // Gọi fetchUsers mỗi khi currentPage, searchTerm, hoặc selectedRole thay đổi
    void loadRoles(abortController.signal);
    void fetchUsers(
      currentPage,
      pageSize,
      searchTerm,
      selectedRole,
      abortController.signal
    );

    return () => {
      abortController.abort();
    };
    // Thêm các dependency để kích hoạt việc fetch lại dữ liệu
  }, [notify, currentPage, pageSize, searchTerm, selectedRole, fetchUsers]);

  // --- 3. HANDLERS ĐỂ RESET PAGE VỀ 1 KHI TÌM KIẾM/LỌC ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // QUAN TRỌNG: Reset về trang 1
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1); // QUAN TRỌNG: Reset về trang 1
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler để refresh list sau khi tạo/sửa
  const handleSuccess = () => {
    setShowModal(false);
    const abortController = new AbortController();
    // Fetch lại trang hiện tại với filter hiện tại
    void fetchUsers(
      currentPage,
      pageSize,
      searchTerm,
      selectedRole,
      abortController.signal
    );
  };

  // Handler sau khi xóa
  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await api.delete(`/users/${userToDelete}`);
        notify("success", "User deleted successfully");

        // Fetch lại list để đảm bảo pagination chính xác
        const abortController = new AbortController();
        void fetchUsers(
          currentPage,
          pageSize,
          searchTerm,
          selectedRole,
          abortController.signal
        );
      } catch (error: unknown) {
        console.error("Error deleting user:", error);
        notify("error", `Failed to delete user: ${(error as Error).message}`);
      } finally {
        setUserToDelete(null);
        setShowConfirmDialog(false);
      }
    }
  };
  // --------------------------------------------------------

  // Helper functions (Không thay đổi)
  const handleDeleteUser = (publicId: string) => {
    setUserToDelete(publicId);
    setShowConfirmDialog(true);
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "N/A";
  };

  const getStatusInfo = (statusId: number) => {
    switch (statusId) {
      case 3:
        return { color: "success" as const, text: "Active" };
      case 2:
        return { color: "warning" as const, text: "Pending" };
      case 4:
        return { color: "failure" as const, text: "Inactive" };
      default:
        return { color: "info" as const, text: "N/A" };
    }
  };

  // BỎ HOÀN TOÀN logic lọc client-side:
  // const filteredUsers = users.filter((user) => { ... });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button
          color="green"
          size="md"
          onClick={() => {
            setSelectedUser(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          Add New User
        </Button>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <div className="relative w-64">
              <TextInput
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                // Dùng handler đã sửa
                onChange={handleSearchChange}
                icon={HiSearch}
              />
            </div>
            <div className="w-48">
              <Select
                value={selectedRole}
                // Dùng handler đã sửa
                onChange={handleRoleChange}>
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable>
            {/* Cập nhật className cho thead để căn chỉnh text */}
            <TableHead className="text-xs uppercase text-gray-700 dark:text-gray-400">
              <TableRow>
                <TableHeadCell className="w-20 text-center p-3">
                  Avatar
                </TableHeadCell>{" "}
                {/* Căn giữa */}
                <TableHeadCell className="p-3">User Info</TableHeadCell>
                <TableHeadCell className="p-3">Email</TableHeadCell>
                <TableHeadCell className="p-3">Role</TableHeadCell>
                <TableHeadCell className="p-3 text-center">
                  Status
                </TableHeadCell>{" "}
                {/* Căn giữa */}
                <TableHeadCell className="p-3 text-center">
                  Actions
                </TableHeadCell>{" "}
                {/* Căn giữa */}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {/* Tăng py */}
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {" "}
                    {/* Tăng py */}
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                // Map qua users
                users.map((user) => {
                  const statusInfo = getStatusInfo(user.statusId);
                  return (
                    <TableRow
                      key={user.publicId}
                      className="!bg-white dark:!border-gray-700 dark:!bg-gray-800">
                      {/* Sử dụng Table.Cell và thêm className để tăng padding */}
                      <TableCell className="p-3 text-center">
                        <div className="flex justify-center">
                          <Avatar
                            img={user.avatarUrl}
                            rounded
                            size="md"
                            placeholderInitials={user.name.charAt(0)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {user.phone || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">{user.email}</TableCell>
                      <TableCell className="p-3">
                        <Badge color="info" size="sm">
                          {getRoleName(user.roleId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Badge color={statusInfo.color} size="sm">
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {" "}
                          {/* Căn giữa actions */}
                          <Button
                            size="xs"
                            color="info" // Giữ màu info
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}>
                            {/* Đổi màu icon thành màu xám nhẹ, khi hover thành màu info/yellow */}
                            <HiPencil className="h-4 w-4 text-gray-500 hover:text-cyan-600" />
                          </Button>
                          <Button
                            size="xs"
                            color="failure" // Giữ màu failure
                            onClick={() => handleDeleteUser(user.publicId)}>
                            {/* Đổi màu icon thành màu xám nhẹ, khi hover thành màu red */}
                            <HiTrash className="h-4 w-4 text-gray-500 hover:text-red-700" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this user?"
      />

      {/* User Form Modal */}
      <UserFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        // Dùng handler đã tối ưu
        onSuccess={handleSuccess}
        userData={selectedUser}
      />
    </div>
  );
};
