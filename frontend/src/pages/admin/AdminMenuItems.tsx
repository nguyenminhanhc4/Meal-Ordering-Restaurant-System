import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Button,
  Card,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableHeadCell,
  Badge,
  TextInput,
  Select,
} from "flowbite-react";
import {
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiMenuAlt1,
} from "react-icons/hi";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { MenuItemFormModal } from "../../components/modal/menuItem/MenuItemFormModal";
import type {
  MenuItem,
  MenuItemSearchRequest,
  Category,
  StatusParam,
} from "../../services/types/menuItem";
import { useTranslation } from "react-i18next";
import { AxiosError, isAxiosError } from "axios";

function AdminMenuItems() {
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<StatusParam[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<
    MenuItem | undefined
  >(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pageSize = 15;

  const searchRequest = useMemo<MenuItemSearchRequest>(
    () => ({
      name: searchTerm.trim() || undefined,
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      statusId: selectedStatus ? parseInt(selectedStatus) : undefined,
      sortBy: "id",
      sortDirection: "desc",
    }),
    [searchTerm, selectedCategory, selectedStatus]
  );

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [categoriesRes, statusesRes] = await Promise.all([
          api.get<Category[]>("/categories"),
          api.get<{ data: StatusParam[] }>("/params?type=MENU_ITEM_STATUS"),
        ]);

        setCategories(categoriesRes.data || []);
        setStatuses(statusesRes.data?.data || []);
      } catch (error) {
        console.error("Error loading reference data:", error);
        notify("error", t("admin.menuItems.notifications.loadRefError"));
      }
    };

    void loadReferenceData();
  }, [refreshTrigger, notify, t]);

  // Load menu items
  useEffect(() => {
    const abortController = new AbortController();

    const loadMenuItems = async () => {
      setLoading(true);
      try {
        let response;
        try {
          response = await api.post(
            `/menu-items/admin/search?page=${currentPage - 1}&size=${pageSize}`,
            searchRequest,
            { signal: abortController.signal }
          );
        } catch {
          response = await api.get(
            `/menu-items/admin?page=${
              currentPage - 1
            }&size=${pageSize}&sortBy=id&sortDirection=desc`,
            { signal: abortController.signal }
          );
        }

        const result = response.data.data || response.data;
        setMenuItems(result.content || result || []);
        setTotalPages(result.totalPages || 1);
        setTotalItems(result.totalElements || result.length || 0);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Fetch menu items error:", error);
          notify("error", t("admin.menuItems.notifications.loadError"));
          setMenuItems([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    void loadMenuItems();
    return () => abortController.abort();
  }, [currentPage, searchRequest, refreshTrigger, notify, t]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedStatus(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    []
  );

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!menuItemToDelete) return;

    try {
      await api.delete(`/menu-items/admin/${menuItemToDelete}`);
      notify("success", t("admin.menuItems.notifications.deleteSuccess"));

      setRefreshTrigger((prev) => prev + 1);
      const remaining = totalItems - 1;
      const maxPage = Math.ceil(remaining / pageSize) || 1;
      if (currentPage > maxPage) setCurrentPage(1);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const msg = axiosError.response?.data?.message ?? axiosError.message;
        const status = axiosError.response?.status;

        if (status === 400 && msg?.includes("foreign key")) {
          notify("error", t("admin.menuItems.notifications.deleteForeignKey"));
        } else if (status === 404) {
          notify("error", t("admin.menuItems.notifications.deleteNotFound"));
        } else if (status === 403) {
          notify("error", t("admin.menuItems.notifications.deleteForbidden"));
        } else {
          notify(
            "error",
            t("admin.menuItems.notifications.deleteError", { error: msg })
          );
        }
      } else {
        // Lỗi không phải từ Axios (rất hiếm)
        const msg = error instanceof Error ? error.message : "Unknown error";
        notify(
          "error",
          t("admin.menuItems.notifications.deleteError", { error: msg })
        );
      }
    } finally {
      setMenuItemToDelete(null);
      setShowConfirmDialog(false);
    }
  }, [menuItemToDelete, notify, totalItems, pageSize, currentPage, t]);

  const handleDeleteMenuItem = useCallback((id: number) => {
    setMenuItemToDelete(id);
    setShowConfirmDialog(true);
  }, []);

  const getCategoryName = useCallback(
    (id: number) => {
      return categories.find((c) => c.id === id)?.name || "Unknown";
    },
    [categories]
  );

  const getStatusBadgeColor = useCallback((status: string) => {
    return status === "AVAILABLE"
      ? "success"
      : status === "OUT_OF_STOCK"
      ? "failure"
      : "gray";
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.menuItems.title")}
        </h1>
        <Button
          color="cyan"
          size="md"
          onClick={() => {
            setSelectedMenuItem(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          {t("admin.menuItems.addButton")}
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <TextInput
                placeholder={t("admin.menuItems.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                icon={HiSearch}
                theme={{
                  field: {
                    input: {
                      base: "!bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-gray-500",
                    },
                  },
                }}
              />
            </div>

            <div className="w-48">
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">{t("admin.menuItems.categoryAll")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-48">
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="focus:ring-cyan-500 focus:border-cyan-500"
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">{t("admin.menuItems.statusAll")}</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.menuItems.table.image")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  <HiMenuAlt1 className="inline mr-2" />
                  {t("admin.menuItems.table.name")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.menuItems.table.category")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.menuItems.table.price")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.menuItems.table.status")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.menuItems.table.stock")}
                </TableHeadCell>
                <TableHeadCell className="text-center p-3 !bg-gray-50 text-gray-700">
                  {t("admin.menuItems.table.actions")}
                </TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("admin.menuItems.loading")}
                  </TableCell>
                </TableRow>
              ) : menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("admin.menuItems.noItems")}
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="bg-white hover:!bg-gray-50">
                    <TableCell className="p-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <HiMenuAlt1 className="text-gray-400 text-xl" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500 line-clamp-2">
                          {item.description ||
                            t("admin.menuItems.noDescription")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <Badge color="info" className="text-xs">
                        {getCategoryName(item.categoryId)}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-3">
                      <span className="font-semibold text-green-600">
                        {formatPrice(item.price)}
                      </span>
                    </TableCell>

                    <TableCell className="p-3">
                      <Badge
                        color={getStatusBadgeColor(item.status)}
                        className="text-xs">
                        {t(`admin.menuItems.status.${item.status}`) ||
                          item.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-3">
                      <span
                        className={`font-medium ${
                          (item.availableQuantity || 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                        {item.availableQuantity || 0}
                      </span>
                    </TableCell>

                    <TableCell className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => {
                            setSelectedMenuItem(item);
                            setShowModal(true);
                          }}
                          aria-label={t("common.edit")}
                          title={t("common.edit")}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => handleDeleteMenuItem(item.id)}
                          aria-label={t("common.delete")}
                          title={t("common.delete")}>
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

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setMenuItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t("admin.menuItems.confirm.title")}
        message={t("admin.menuItems.confirm.message")}
      />

      <MenuItemFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        menuItemData={selectedMenuItem}
        categories={categories}
        statuses={statuses}
      />
    </div>
  );
}

export default AdminMenuItems;
