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
import { HiSearch, HiPlus, HiPencil, HiTrash, HiMenuAlt1 } from "react-icons/hi";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { MenuItemFormModal } from "../../components/menuItem/MenuItemFormModal";
import type { 
  MenuItem, 
  MenuItemSearchRequest, 
  Category, 
  StatusParam 
} from "../../services/types/menuItem";

function AdminMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<StatusParam[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pageSize = 15;
  const { notify } = useNotification();

  // Memoize search request to prevent unnecessary re-renders
  const searchRequest = useMemo<MenuItemSearchRequest>(() => ({
    name: searchTerm.trim() || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    statusId: selectedStatus ? parseInt(selectedStatus) : undefined,
    sortBy: "id",
    sortDirection: "desc"
  }), [searchTerm, selectedCategory, selectedStatus]);

  // Load reference data (categories, statuses)
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [categoriesRes, statusesRes] = await Promise.all([
          api.get('/categories'),
          api.get('/params?type=MENU_ITEM_STATUS') // Use existing API that works
        ]);
        
        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        
        if (statusesRes.data?.data) {
          setStatuses(statusesRes.data.data);
          console.log("📊 STATUS DEBUG - API Response:", statusesRes.data);
          console.log("📊 STATUS DEBUG - Statuses array:", statusesRes.data.data);
          statusesRes.data.data.forEach((status: StatusParam) => {
            console.log(`📊 STATUS DEBUG - Item: ID=${status.id}, Code=${status.code}, Name=${status.name}`);
          });
        }
      } catch (error) {
        console.error("❌ STATUS DEBUG - Error loading reference data:", error);
        notify("error", "Could not load reference data");
      }
    };

    void loadReferenceData();
  }, [refreshTrigger, notify]);

  // Load menu items with search/filter
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
        } catch (searchError) {
          console.warn("Search endpoint failed, trying fallback:", searchError);
          response = await api.get(
            `/menu-items/admin?page=${currentPage - 1}&size=${pageSize}&sortBy=id&sortDirection=desc`, 
            { signal: abortController.signal }
          );
        }

        if (response.data) {
          const result = response.data.data || response.data;
          setMenuItems(result.content || result || []);
          setTotalPages(result.totalPages || 1);
          setTotalItems(result.totalElements || result.length || 0);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Fetch menu items error:", error);
          notify("error", "Could not load menu items. Please check if backend is running.");
          setMenuItems([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadMenuItems();

    return () => {
      abortController.abort();
    };
  }, [currentPage, searchRequest, refreshTrigger, notify]); // Added refreshTrigger here

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (menuItemToDelete) {
      try {
        console.log("🗑️ Deleting menu item ID:", menuItemToDelete);
        await api.delete(`/menu-items/admin/${menuItemToDelete}`);
        console.log("✅ Delete successful, refreshing data...");
        notify("success", "Menu item deleted successfully");
        
        // Trigger refresh by updating refreshTrigger
        setRefreshTrigger(prev => prev + 1);
        
        // Also reset to first page if we deleted the last item on current page
        const remainingItems = totalItems - 1;
        const maxPage = Math.ceil(remainingItems / pageSize) || 1;
        if (currentPage > maxPage) {
          setCurrentPage(1);
        }
        
      } catch (error: unknown) {
        console.error("❌ Error deleting menu item:", error);
        
        // Enhanced error handling for delete operation
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { 
            status?: number; 
            message?: string; 
            response?: { data?: { message?: string; error?: string } }; 
            config?: { url?: string } 
          };
          
          console.error("📊 DELETE DEBUG - Error details:");
          console.error("  - Status:", axiosError.status);
          console.error("  - URL:", axiosError.config?.url);
          console.error("  - Response data:", axiosError.response?.data);
          
          if (axiosError.status === 400) {
            const errorMsg = axiosError.response?.data?.message || axiosError.response?.data?.error;
            if (errorMsg && errorMsg.includes("foreign key")) {
              notify("error", "Cannot delete this menu item because it's being used in orders or other records.");
            } else if (errorMsg && errorMsg.includes("not found")) {
              notify("error", "Menu item not found. It may have been already deleted.");
            } else {
              notify("error", `Cannot delete menu item: ${errorMsg || "Invalid request"}`);
            }
          } else if (axiosError.status === 404) {
            notify("error", "Menu item not found. It may have been already deleted.");
          } else if (axiosError.status === 403) {
            notify("error", "You don't have permission to delete this menu item.");
          } else {
            notify("error", `Failed to delete menu item: ${axiosError.response?.data?.message || axiosError.message}`);
          }
        } else {
          notify("error", `Failed to delete menu item: ${(error as Error).message}`);
        }
      } finally {
        setMenuItemToDelete(null);
        setShowConfirmDialog(false);
      }
    }
  }, [menuItemToDelete, notify, totalItems, pageSize, currentPage, setCurrentPage]);

  const handleDeleteMenuItem = useCallback((id: number) => {
    setMenuItemToDelete(id);
    setShowConfirmDialog(true);
  }, []);

  const getCategoryName = useCallback((categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  }, [categories]);

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "OUT_OF_STOCK":
        return "failure";
      default:
        return "gray";
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-none">
        <h1 className="text-2xl font-bold text-gray-800">Menu Items Management</h1>
        <Button
          color="cyan"
          size="md"
          onClick={() => {
            setSelectedMenuItem(undefined);
            setShowModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          Add New Menu Item
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            {/* Fallback search input for debugging */}
            <div className="relative w-64" style={{ zIndex: 2 }}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  cursor: 'text',
                  fontSize: '14px',
                  minHeight: '40px'
                }}
              />
            </div>
            
            {/* Original Flowbite TextInput (hidden for now) */}
            <div className="relative w-64 hidden" style={{ zIndex: 1 }}>
              <TextInput
                id="search-input"
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={HiSearch}
                className="focus:ring-cyan-500 focus:border-cyan-500"
                style={{ 
                  cursor: 'text',
                  minHeight: '42px',
                  opacity: 1,
                  visibility: 'visible',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db'
                }}
                theme={{
                  field: {
                    input: {
                      base: "!bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:!ring-cyan-500 focus:!border-cyan-500 cursor-text opacity-100",
                      colors: {
                        gray: "!bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:!ring-cyan-500 focus:!border-cyan-500 cursor-text opacity-100"
                      }
                    },
                  },
                }}
              />
              {/* Debug text để test visibility */}
              <div className="text-xs text-gray-500 mt-1">
                Search input {searchTerm ? `(${searchTerm.length} chars)` : '(empty)'}
              </div>
            </div>
            <div className="w-48">
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="focus:ring-cyan-500 focus:border-cyan-500"
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.code}
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
                  Image
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  <HiMenuAlt1 className="inline mr-2" />
                  Menu Item
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  Category
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  Price
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  Status
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                  Stock
                </TableHeadCell>
                <TableHeadCell className="p-3 !bg-gray-50 text-gray-700 text-center">
                  Actions
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center bg-white text-gray-700 py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : menuItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center bg-white text-gray-700 py-4">
                    No menu items found
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((menuItem) => (
                  <TableRow
                    key={menuItem.id}
                    className="bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <TableCell className="p-3 bg-white text-gray-700">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        {menuItem.avatarUrl ? (
                          <img
                            src={menuItem.avatarUrl}
                            alt={menuItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <HiMenuAlt1 className="text-gray-400 text-xl" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {menuItem.name}
                        </span>
                        <span className="text-sm text-gray-500 line-clamp-2">
                          {menuItem.description || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <Badge color="info" className="text-xs">
                        {getCategoryName(menuItem.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <span className="font-semibold text-green-600">
                        {formatPrice(menuItem.price)}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <Badge 
                        color={getStatusBadgeColor(menuItem.status)}
                        className="text-xs"
                      >
                        {menuItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <span className={`font-medium ${
                        (menuItem.availableQuantity || 0) > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {menuItem.availableQuantity || 0}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="xs"
                          color="blue"
                          className="bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-300"
                          onClick={() => {
                            setSelectedMenuItem(menuItem);
                            setShowModal(true);
                          }}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          className="bg-red-500 hover:bg-red-600 focus:ring-red-300"
                          onClick={() => handleDeleteMenuItem(menuItem.id)}>
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
          setMenuItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this menu item?"
      />

      {/* MenuItem Form Modal */}
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