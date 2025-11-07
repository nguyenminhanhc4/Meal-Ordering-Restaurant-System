import { useEffect, useState, useCallback } from "react";
import {
  Button,
  TextInput,
  Card,
  Avatar,
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
import { UserFormModal } from "../../components/modal/user/UserFormModal";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useTranslation } from "react-i18next"; // <-- added

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
  const { t } = useTranslation(); // <-- i18n hook
  const { notify } = useNotification();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchUsers = useCallback(
    async (
      page: number,
      size: number,
      keyword: string,
      roleId: string,
      signal: AbortSignal
    ) => {
      setLoading(true);
      try {
        const response = await api.get("/users", {
          signal,
          params: {
            page: page - 1,
            size: size,
            sort: "id,desc",
            keyword: keyword.trim() || undefined,
            roleId: roleId || undefined,
          },
        });

        const result = response.data?.data;
        if (result) {
          setUsers(result.data || []);
          const metadata = result.metadata;
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
          notify("error", t("admin.users.notifications.loadError"));
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
    [notify, t]
  );

  useEffect(() => {
    const abortController = new AbortController();

    const loadRoles = async (signal: AbortSignal) => {
      try {
        const rolesResponse = await api.get("/params?type=ROLE", { signal });
        if (rolesResponse.data?.data) {
          setRoles(rolesResponse.data.data);
        }
      } catch {
        if (!signal.aborted) {
          notify("error", t("admin.users.notifications.loadRolesError"));
        }
      }
    };

    void loadRoles(abortController.signal);
    void fetchUsers(
      currentPage,
      pageSize,
      searchTerm,
      selectedRole,
      abortController.signal
    );

    return () => abortController.abort();
  }, [currentPage, searchTerm, selectedRole, fetchUsers, notify, t]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSuccess = () => {
    setShowModal(false);
    const ctrl = new AbortController();
    void fetchUsers(
      currentPage,
      pageSize,
      searchTerm,
      selectedRole,
      ctrl.signal
    );
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await api.delete(`/users/${userToDelete}`);
        notify("success", t("admin.users.notifications.deleteSuccess"));

        const ctrl = new AbortController();
        void fetchUsers(
          currentPage,
          pageSize,
          searchTerm,
          selectedRole,
          ctrl.signal
        );
      } catch (error: unknown) {
        const msg = (error as Error).message || "Unknown error";
        notify(
          "error",
          t("admin.users.notifications.deleteError", { error: msg })
        );
      } finally {
        setUserToDelete(null);
        setShowConfirmDialog(false);
      }
    }
  };

  const handleDeleteUser = (publicId: string) => {
    setUserToDelete(publicId);
    setShowConfirmDialog(true);
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.code : "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-none">
        <h1 className="text-2xl font-bold">{t("admin.users.title")}</h1>
        <Button
          color="cyan"
          size="md"
          onClick={() => {
            setSelectedUser(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          {t("admin.users.addButton")}
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative w-64">
              <TextInput
                type="text"
                placeholder={t("admin.users.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                icon={HiSearch}
                theme={{
                  field: {
                    input: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
            </div>

            {/* Role Filter */}
            <div className="w-48">
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">{t("admin.users.roleAll")}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  {t("admin.users.table.avatar")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.users.table.userInfo")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.users.table.email")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.users.table.role")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700 text-center">
                  {t("admin.users.table.actions")}
                </TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.users.loading")}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.users.noUsers")}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.publicId}
                    className="bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <div className="flex justify-center">
                        <Avatar
                          img={user.avatarUrl}
                          rounded
                          size="md"
                          placeholderInitials={user.name.charAt(0)}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {user.phone || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700">
                      {user.email}
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700">
                      {getRoleName(user.roleId)}
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <div className="flex gap-2 justify-center">
                        {/* Edit */}
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          aria-label={t("admin.users.editTooltip")}
                          title={t("admin.users.editTooltip")}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>

                        {/* Delete */}
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => handleDeleteUser(user.publicId)}
                          aria-label={t("admin.users.deleteTooltip")}
                          title={t("admin.users.deleteTooltip")}>
                          <HiTrash className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t("admin.users.confirm.title")}
        message={t("admin.users.confirm.message")}
      />

      {/* User Form Modal */}
      <UserFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        userData={selectedUser}
      />
    </div>
  );
};
