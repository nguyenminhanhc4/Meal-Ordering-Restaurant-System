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
import { useNotification } from "../../../components/Notification";
import { Pagination } from "../../../components/common/Pagination";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { ComboFormModal } from "../../../components/modal/combo/ComboFormModal";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../store/AuthContext";
import {
  type Combo,
  deleteCombo,
  getAllCombos,
} from "../../../services/product/fetchCombo";
import { type Category } from "../../../services/category/fetchCategories";
import api from "../../../api/axios";

interface StatusParam {
  id: number;
  code: string;
}

function AdminCombos() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { user } = useAuth();

  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<StatusParam[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | undefined>(
    undefined
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pageSize = 15;

  const searchRequest = useMemo(
    () => ({
      search: searchTerm.trim(),
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      statusId: selectedStatus ? parseInt(selectedStatus) : undefined,
    }),
    [searchTerm, selectedCategory, selectedStatus]
  );

  // Load danh mục & trạng thái
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        // Lấy tất cả danh mục
        const [catRes, statusRes] = await Promise.all([
          api.get<Category[]>("/categories"),
          api.get<{ data: StatusParam[] }>("/params?type=MENU_ITEM_STATUS"),
        ]);

        const allCategories = catRes.data || [];

        // Tìm danh mục "Combo"
        const comboCategory = allCategories.find(
          (c) => c.name.toLowerCase() === "combo"
        );

        let comboCategories: Category[] = [];
        if (comboCategory) {
          // Gọi API lấy danh mục con của combo
          const childRes = await api.get<Category[]>(
            `/categories/tree/${comboCategory.id}/tree`
          );
          comboCategories = childRes.data || [];
        }

        setCategories(comboCategories);
        setStatuses(statusRes.data?.data || []);
      } catch (err) {
        console.error(err);
        notify("error", t("admin.combos.notifications.loadRefError"));
      }
    };

    void loadReferenceData();
  }, [notify, t, refreshTrigger]);

  // Load combos
  useEffect(() => {
    const loadCombos = async () => {
      setLoading(true);
      try {
        const data = await getAllCombos(
          currentPage - 1,
          pageSize,
          searchTerm,
          selectedCategory ? parseInt(selectedCategory) : undefined,
          selectedStatus ? parseInt(selectedStatus) : undefined
        );

        setCombos(data.content);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalElements);
      } catch (err) {
        console.error(err);
        notify("error", t("admin.combos.notifications.loadError"));
      } finally {
        setLoading(false);
      }
    };
    void loadCombos();
  }, [
    currentPage,
    searchRequest,
    refreshTrigger,
    notify,
    t,
    searchTerm,
    selectedCategory,
    selectedStatus,
  ]);

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
    if (!comboToDelete) return;
    try {
      await deleteCombo(comboToDelete);
      notify("success", t("admin.combos.notifications.deleteSuccess"));
      setRefreshTrigger((prev) => prev + 1);
      const remaining = totalItems - 1;
      const maxPage = Math.ceil(remaining / pageSize) || 1;
      if (currentPage > maxPage) setCurrentPage(1);
    } catch (err) {
      console.log(err);
      notify("error", t("admin.combos.notifications.deleteError"));
    } finally {
      setComboToDelete(null);
      setShowConfirmDialog(false);
    }
  }, [comboToDelete, notify, totalItems, currentPage, t]);

  const handleDeleteCombo = useCallback((id: number) => {
    setComboToDelete(id);
    setShowConfirmDialog(true);
  }, []);

  const getStatusBadgeColor = useCallback((status: string) => {
    return status === "AVAILABLE"
      ? "success"
      : status === "OUT_OF_STOCK"
      ? "failure"
      : "gray";
  }, []);

  const formatPrice = useCallback(
    (price: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price),
    []
  );

  function renderCategoryOptions(
    categories: Category[],
    level: number = 0
  ): JSX.Element[] {
    return categories.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {"— ".repeat(level) + cat.name}
      </option>,
      ...(cat.children ? renderCategoryOptions(cat.children, level + 1) : []),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("admin.combos.title")}</h1>
        <Button
          color="cyan"
          size="md"
          onClick={() => {
            setSelectedCombo(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          {t("admin.combos.addButton")}
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <TextInput
                placeholder={t("admin.combos.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                icon={HiSearch}
                theme={{
                  field: {
                    input: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-gray-500",
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
                <option value="">{t("admin.combos.categoryAll")}</option>
                {renderCategoryOptions(categories)}
              </Select>
            </div>

            <div className="w-48">
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">{t("admin.combos.statusAll")}</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.code}
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
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.combos.table.image")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  <HiMenuAlt1 className="inline mr-2" />
                  {t("admin.combos.table.name")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.combos.table.category")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.combos.table.price")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.combos.table.status")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700 text-center">
                  {t("admin.combos.table.actions")}
                </TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y">
              {loading ? (
                <TableRow className="bg-white hover:!bg-gray-100">
                  <TableCell colSpan={6} className="text-center py-4">
                    {t("admin.combos.loading")}
                  </TableCell>
                </TableRow>
              ) : combos.length === 0 ? (
                <TableRow className="bg-white hover:!bg-gray-100">
                  <TableCell colSpan={6} className="text-center py-4">
                    {t("admin.combos.noItems")}
                  </TableCell>
                </TableRow>
              ) : (
                combos.map((combo) => (
                  <TableRow
                    key={combo.id}
                    className="bg-white hover:!bg-gray-50">
                    <TableCell className="p-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        {combo.avatarUrl ? (
                          <img
                            src={combo.avatarUrl}
                            alt={combo.name}
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
                          {combo.name}
                        </span>
                        <span className="text-sm text-gray-500 line-clamp-2">
                          {combo.description || t("admin.combos.noDescription")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <Badge color="info" className="text-xs">
                        {combo.category || "Unknown"}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-3">
                      <span className="font-semibold text-green-600">
                        {formatPrice(combo.price)}
                      </span>
                    </TableCell>

                    <TableCell className="p-3">
                      <Badge
                        color={getStatusBadgeColor(combo.status)}
                        className="text-xs">
                        {t(`admin.combos.status.${combo.status}`) ||
                          combo.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => {
                            setSelectedCombo(combo);
                            setShowModal(true);
                          }}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>
                        {user?.role === "ADMIN" && (
                          <Button
                            size="xs"
                            color="red"
                            onClick={() => handleDeleteCombo(combo.id)}>
                            <HiTrash className="h-4 w-4 text-white" />
                          </Button>
                        )}
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

      {/* Dialog + Modal */}
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setComboToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t("admin.combos.confirm.title")}
        message={t("admin.combos.confirm.message")}
      />

      <ComboFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        comboData={selectedCombo}
        categories={categories}
        statuses={statuses}
      />
    </div>
  );
}

export default AdminCombos;
