import { useEffect, useState } from "react";
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
  HiCollection,
} from "react-icons/hi";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { CategoryFormModal } from "../../components/modal/category/CategoryFormModal";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

interface Category {
  id: number;
  name: string;
  description: string;
  parentId?: number;
}

interface CategorySearchRequest {
  name?: string;
  description?: string;
  parentId?: number;
  hasParent?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

function AdminCategories() {
  const { t } = useTranslation(); // <-- i18n hook
  const { notify } = useNotification();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pageSize = 15;

  // Load parent categories
  useEffect(() => {
    const abortController = new AbortController();

    const loadParentCategories = async () => {
      try {
        const response = await api.get("/categories", {
          signal: abortController.signal,
        });
        if (response.data) setParentCategories(response.data);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Fetch parent categories error:", error);
          notify("error", t("admin.categories.notifications.loadParentsError"));
          setParentCategories([]);
        }
      }
    };

    void loadParentCategories();
    return () => abortController.abort();
  }, [refreshTrigger, notify, t]);

  // Load categories with search/filter
  useEffect(() => {
    const abortController = new AbortController();

    const loadCategories = async () => {
      setLoading(true);
      try {
        const searchRequest: CategorySearchRequest = {
          name: searchTerm.trim() || undefined,
          sortBy: "id",
          sortDirection: "desc",
        };

        if (selectedParent === "0") {
          searchRequest.hasParent = false;
        } else if (selectedParent) {
          searchRequest.parentId = parseInt(selectedParent);
        }

        let response;
        try {
          response = await api.post(
            `/categories/admin/search?page=${currentPage - 1}&size=${pageSize}`,
            searchRequest,
            { signal: abortController.signal }
          );
        } catch {
          response = await api.get(
            `/categories/paginated?page=${
              currentPage - 1
            }&size=${pageSize}&sortBy=id&sortDirection=desc`,
            { signal: abortController.signal }
          );
        }

        const result = response.data;
        setCategories(result.content || result || []);
        setTotalPages(result.totalPages || 1);
        setTotalItems(result.totalElements || result.length || 0);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Fetch categories error:", error);
          notify("error", t("admin.categories.notifications.loadError"));
          setCategories([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    void loadCategories();
    return () => abortController.abort();
  }, [currentPage, searchTerm, selectedParent, refreshTrigger, notify, t]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParent(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete}`);
      notify("success", t("admin.categories.notifications.deleteSuccess"));
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg =
        axiosError.response?.data?.message ??
        axiosError.message ??
        "Unknown error";

      notify(
        "error",
        t("admin.categories.notifications.deleteError", { error: msg })
      );
    } finally {
      setCategoryToDelete(null);
      setShowConfirmDialog(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setShowConfirmDialog(true);
  };

  const getParentName = (parentId?: number) => {
    if (!parentId) return t("admin.categories.rootBadge");
    const parent = parentCategories.find((p) => p.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-none">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.categories.title")}
        </h1>
        <Button
          color="cyan"
          size="md"
          onClick={() => {
            setSelectedCategory(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          {t("admin.categories.addButton")}
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
                placeholder={t("admin.categories.searchPlaceholder")}
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

            {/* Parent Filter */}
            <div className="w-48">
              <Select
                value={selectedParent}
                onChange={handleParentChange}
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">{t("admin.categories.parentAll")}</option>
                <option value="0">{t("admin.categories.parentRoot")}</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {t("admin.categories.parentUnder", { name: parent.name })}
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
                  <HiCollection className="inline mr-2" />
                  {t("admin.categories.table.name")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.categories.table.description")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  {t("admin.categories.table.parent")}
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700 text-center">
                  {t("admin.categories.table.actions")}
                </TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.categories.loading")}
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.categories.noItems")}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="bg-white hover:bg-gray-50">
                    <TableCell className="p-3 bg-white text-gray-700">
                      <div className="flex items-center">
                        <HiCollection className="mr-2 text-cyan-500" />
                        <span className="font-semibold text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700">
                      <span className="text-sm text-gray-600">
                        {category.description ||
                          t("admin.categories.noDescription")}
                      </span>
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700">
                      <Badge
                        color={category.parentId ? "info" : "success"}
                        className="text-xs">
                        {getParentName(category.parentId)}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowModal(true);
                          }}
                          aria-label={t("admin.categories.editTooltip")}
                          title={t("admin.categories.editTooltip")}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => handleDeleteCategory(category.id)}
                          aria-label={t("admin.categories.deleteTooltip")}
                          title={t("admin.categories.deleteTooltip")}>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t("admin.categories.confirm.title")}
        message={t("admin.categories.confirm.message")}
      />

      {/* Form Modal */}
      <CategoryFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        categoryData={selectedCategory}
      />
    </div>
  );
}

export default AdminCategories;
