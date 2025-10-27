import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Badge,
} from "flowbite-react";
import {
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiOutlineCube,
} from "react-icons/hi";
import {
  getAllIngredients,
  deleteIngredient,
  createIngredient,
  updateIngredient,
  type Ingredient,
} from "../../services/ingredient/ingredientService";
import { useTranslation } from "react-i18next"; // Add useTranslation
import { useNotification } from "../../components/Notification";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pagination } from "../../components/common/Pagination";
import IngredientFormModal from "../../components/modal/ingredient/IngredientFormModal";

function AdminIngredients() {
  const { t } = useTranslation(); // Add hook useTranslation
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<number | null>(
    null
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<
    Ingredient | undefined
  >();

  const { notify } = useNotification();

  // ✅ Filter params
  const filterParams = useMemo(
    () => ({
      search: searchTerm.trim() || undefined,
    }),
    [searchTerm]
  );

  // ✅ Load ingredients
  useEffect(() => {
    const loadIngredients = async () => {
      setLoading(true);
      try {
        const allIngredients = await getAllIngredients();
        let filtered = allIngredients;

        if (filterParams.search) {
          filtered = filtered.filter((i) =>
            i.name
              .toLowerCase()
              .includes((filterParams.search ?? "").toLowerCase())
          );
        }

        setTotalItems(filtered.length);

        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setIngredients(filtered.slice(start, end));
      } catch (error) {
        console.error("❌ Error fetching ingredients:", error);
        notify("error", t("admin.ingredients.notifications.loadError")); // Use i18n
      } finally {
        setLoading(false);
      }
    };

    void loadIngredients();
  }, [filterParams, currentPage, pageSize, refreshTrigger, notify, t]); // Add t to dependencies

  // ✅ Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteIngredient = useCallback((id: number) => {
    setIngredientToDelete(id);
    setShowConfirmDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!ingredientToDelete) return;
    try {
      await deleteIngredient(ingredientToDelete);
      notify("success", t("admin.ingredients.notifications.deleteSuccess")); // Use i18n
      setRefreshTrigger((p) => p + 1);
    } catch (error) {
      console.log(error);
      notify("error", t("admin.ingredients.notifications.deleteError")); // Use i18n
    } finally {
      setShowConfirmDialog(false);
      setIngredientToDelete(null);
    }
  }, [ingredientToDelete, notify, t]); // Add t to dependencies

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.ingredients.title")} {/* Use i18n */}
        </h1>
        <Button
          color="cyan"
          onClick={() => {
            setEditingIngredient(undefined);
            setShowFormModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          {t("admin.ingredients.addNewIngredient")} {/* Use i18n */}
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Search bar */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <TextInput
              placeholder={t("admin.ingredients.searchPlaceholder")} // Use i18n
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              style={{
                cursor: "text",
                minHeight: "42px",
                opacity: 1,
                visibility: "visible",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
              }}
              theme={{
                field: {
                  input: {
                    base: "!bg-white border-gray-300 !text-gray-900 !placeholder-gray-400 focus:!ring-cyan-500 focus:!border-cyan-500 cursor-text opacity-100",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                <HiOutlineCube className="inline mr-2" />{" "}
                {t("admin.ingredients.tableHeaders.name")} {/* Use i18n */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {t("admin.ingredients.tableHeaders.quantity")} {/* Use i18n */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {t("admin.ingredients.tableHeaders.unit")} {/* Use i18n */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {t("admin.ingredients.tableHeaders.minStock")} {/* Use i18n */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {t("admin.ingredients.tableHeaders.status")} {/* Use i18n */}
              </TableHeadCell>
              <TableHeadCell className="text-center p-3 !bg-gray-50 text-gray-700">
                {t("admin.ingredients.tableHeaders.actions")} {/* Use i18n */}
              </TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.ingredients.tableMessages.loading")}{" "}
                    {/* Use i18n */}
                  </TableCell>
                </TableRow>
              ) : ingredients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.ingredients.tableMessages.noIngredientsFound")}{" "}
                    {/* Use i18n */}
                  </TableCell>
                </TableRow>
              ) : (
                ingredients.map((ing) => {
                  const isLow = ing.quantity <= (ing.minimumStock ?? 0);
                  return (
                    <TableRow
                      key={ing.id}
                      className="!bg-gray-50 hover:!bg-gray-100 transition-colors duration-150">
                      <TableCell className="p-3 bg-white text-gray-700">
                        {ing.name}
                      </TableCell>
                      <TableCell className="p-3 bg-white text-gray-700">
                        {ing.quantity}
                      </TableCell>
                      <TableCell className="p-3 bg-white text-gray-700">
                        {ing.unit}
                      </TableCell>
                      <TableCell className="p-3 bg-white text-gray-700">
                        {ing.minimumStock}
                      </TableCell>
                      <TableCell className="p-3 bg-white text-gray-700">
                        <Badge color={isLow ? "failure" : "success"}>
                          {t(
                            `admin.ingredients.status.${
                              isLow ? "lowStock" : "ok"
                            }`
                          )}{" "}
                          {/* Use i18n */}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-3 bg-white text-gray-700">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="xs"
                            color="blue"
                            onClick={() => {
                              setEditingIngredient(ing);
                              setShowFormModal(true);
                            }}>
                            <HiPencil className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            onClick={() => handleDeleteIngredient(ing.id!)}>
                            <HiTrash className="h-4 w-4 text-white" />
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
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      </Card>

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        message={t("admin.ingredients.confirmDialog.deleteMessage")} // Use i18n
        confirmText={t("common.confirmDialog.delete")} // Use i18n
      />

      <IngredientFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        existingIngredient={editingIngredient}
        onSuccess={async (data) => {
          try {
            if (editingIngredient) {
              await updateIngredient(editingIngredient.id!, data);
              notify(
                "success",
                t("admin.ingredients.notifications.updateSuccess")
              ); // Use i18n
            } else {
              await createIngredient(data);
              notify(
                "success",
                t("admin.ingredients.notifications.createSuccess")
              ); // Use i18n
            }
            setShowFormModal(false);
            setRefreshTrigger((p) => p + 1);
          } catch (err) {
            console.error(err);
            notify("error", t("admin.ingredients.notifications.saveError")); // Use i18n
          }
        }}
      />
    </div>
  );
}

export default AdminIngredients;
