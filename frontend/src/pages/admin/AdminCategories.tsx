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
import { HiSearch, HiPlus, HiPencil, HiTrash, HiCollection } from "react-icons/hi";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { CategoryFormModal } from "../../components/category/CategoryFormModal";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pageSize = 15;
  const { notify } = useNotification();



  // useEffect để fetch data khi component mount và khi có thay đổi
  useEffect(() => {
    const abortController = new AbortController();

    // Function để load parent categories
    const loadParentCategories = async () => {
      try {
        const response = await api.get('/categories', { signal: abortController.signal });
        if (response.data) {
          setParentCategories(response.data);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Fetch parent categories error:", error);
          setParentCategories([]);
        }
      }
    };

    // Load parent categories khi có refreshTrigger
    void loadParentCategories();
    
    return () => {
      abortController.abort();
    };
  }, [refreshTrigger]); // Chạy lại khi refreshTrigger thay đổi

  // useEffect riêng cho fetchCategories - inline logic để tránh dependency issue
  useEffect(() => {
    const abortController = new AbortController();

    const loadCategories = async () => {
      setLoading(true);
      try {
        const searchRequest: CategorySearchRequest = {
          name: searchTerm.trim() || undefined,
          sortBy: "id",
          sortDirection: "desc"
        };

        // Handle parent filter logic
        if (selectedParent === "0") {
          // Root categories only (hasParent = false)
          searchRequest.hasParent = false;
        } else if (selectedParent) {
          // Specific parent ID
          searchRequest.parentId = parseInt(selectedParent);
        }

        // Thử với endpoint search trước, nếu không có thì fallback
        let response;
        try {
          response = await api.post(
            `/categories/admin/search?page=${currentPage - 1}&size=${pageSize}`,
            searchRequest,
            { signal: abortController.signal }
          );
        } catch (searchError) {
          console.warn("Search endpoint failed, trying fallback:", searchError);
          // Fallback to basic endpoint
          response = await api.get(`/categories/paginated?page=${currentPage - 1}&size=${pageSize}&sortBy=id&sortDirection=desc`, { signal: abortController.signal });
        }

        if (response.data) {
          const result = response.data;
          setCategories(result.content || result || []);
          setTotalPages(result.totalPages || 1);
          setTotalItems(result.totalElements || result.length || 0);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Fetch categories error:", error);
          notify("error", "Could not load categories. Please check if backend is running.");
          setCategories([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      abortController.abort();
    };
  }, [currentPage, searchTerm, selectedParent, notify]);

  // Handlers để reset page về 1 khi tìm kiếm/lọc
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParent(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler để refresh list sau khi tạo/sửa
  const handleSuccess = () => {
    setShowModal(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh cho parent categories
  };

  // Handler sau khi xóa
  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await api.delete(`/categories/${categoryToDelete}`);
        notify("success", "Category deleted successfully");
        setRefreshTrigger(prev => prev + 1); // Trigger refresh cho parent categories
      } catch (error: unknown) {
        console.error("Error deleting category:", error);
        notify("error", `Failed to delete category: ${(error as Error).message}`);
      } finally {
        setCategoryToDelete(null);
        setShowConfirmDialog(false);
      }
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setShowConfirmDialog(true);
  };

  const getParentName = (parentId?: number) => {
    if (!parentId) return "Danh mục gốc";
    const parent = parentCategories.find((p) => p.id === parentId);
    return parent ? parent.name : "Không xác định";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-none">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <Button
          color="cyan"
          size="md"
          onClick={() => {
            setSelectedCategory(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          Thêm danh mục mới
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <div className="relative w-64">
              <TextInput
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={HiSearch}
                className="focus:ring-cyan-500 focus:border-cyan-500"
                theme={{
                  field: {
                    input: {
                      base: "!bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
            </div>
            <div className="w-48">
              <Select
                value={selectedParent}
                onChange={handleParentChange}
                className="focus:ring-cyan-500 focus:border-cyan-500"
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">Tất cả danh mục</option>
                <option value="0">Chỉ danh mục gốc</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    Thuộc: {parent.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <TableRow>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  <HiCollection className="inline mr-2" />
                  Tên danh mục
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  Mô tả
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  Danh mục cha
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700 text-center">
                  Hành động
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center bg-white text-gray-700 py-4">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center bg-white text-gray-700 py-4">
                    Không tìm thấy danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
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
                        {category.description || "Không có mô tả"}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <Badge 
                        color={category.parentId ? "info" : "success"}
                        className="text-xs"
                      >
                        {getParentName(category.parentId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="xs"
                          color="blue"
                          className="bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-300"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowModal(true);
                          }}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          className="bg-red-500 hover:bg-red-600 focus:ring-red-300"
                          onClick={() => handleDeleteCategory(category.id)}>
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
        message="Bạn có chắc chắn muốn xóa danh mục này không?"
      />

      {/* Category Form Modal */}
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