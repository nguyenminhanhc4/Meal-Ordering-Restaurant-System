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
  Select,
  Badge,
} from "flowbite-react";
import {
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { getAllTables, deleteTable } from "../../services/table/tableService";
import api from "../../api/axios";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../components/Notification";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pagination } from "../../components/common/Pagination";
import type { TableEntity } from "../../services/table/tableService";
import { TableFormModal } from "../../components/modal/table/TableFormModal";

function AdminTables() {
  const { t: translate } = useTranslation(); // Rename t to translate
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [locations, setLocations] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [statuses, setStatuses] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [positions, setPositions] = useState<
    { id: number; code: string; name: string }[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableEntity | undefined>();

  const { notify } = useNotification();

  // Filter params
  const filterParams = useMemo(
    () => ({
      search: searchTerm.trim() || undefined,
      locationId: selectedLocation ? parseInt(selectedLocation) : undefined,
      statusId: selectedStatus ? parseInt(selectedStatus) : undefined,
      positionId: selectedPosition ? parseInt(selectedPosition) : undefined,
    }),
    [searchTerm, selectedLocation, selectedStatus, selectedPosition]
  );

  // Load dropdown: location + status + position
  useEffect(() => {
    const loadParams = async () => {
      try {
        const [locRes, statusRes, posRes] = await Promise.all([
          api.get("/params?type=LOCATION"),
          api.get("/params?type=STATUS_TABLE"),
          api.get("/params?type=POSITION"),
        ]);

        setLocations(locRes.data.data || locRes.data || []);
        setStatuses(statusRes.data.data || statusRes.data || []);
        setPositions(posRes.data.data || posRes.data || []);
      } catch (error) {
        console.error("❌ Error loading filter params:", error);
        notify(
          "error",
          translate("admin.tables.notifications.loadFilterError")
        ); // Use translate
      }
    };

    void loadParams();
  }, [notify, translate]); // Update dependency

  // Load tables + FE filter
  useEffect(() => {
    const loadTables = async () => {
      setLoading(true);
      try {
        const allTables = await getAllTables();
        let filtered = allTables;

        if (filterParams.search) {
          filtered = filtered.filter((t) =>
            t.name
              .toLowerCase()
              .includes((filterParams.search ?? "").toLowerCase())
          );
        }
        if (filterParams.locationId) {
          filtered = filtered.filter(
            (t) => t.locationId === filterParams.locationId
          );
        }
        if (filterParams.statusId) {
          filtered = filtered.filter(
            (t) => t.statusId === filterParams.statusId
          );
        }
        if (filterParams.positionId) {
          filtered = filtered.filter(
            (t) => t.positionId === filterParams.positionId
          );
        }

        setTotalItems(filtered.length);

        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setTables(filtered.slice(start, end));
      } catch (error) {
        console.error("❌ Error fetching tables:", error);
        notify(
          "error",
          translate("admin.tables.notifications.loadTablesError")
        ); // Use translate
      } finally {
        setLoading(false);
      }
    };

    void loadTables();
  }, [filterParams, currentPage, pageSize, refreshTrigger, notify, translate]); // Update dependency

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteTable = useCallback((id: number) => {
    setTableToDelete(id);
    setShowConfirmDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!tableToDelete) return;
    try {
      const ok = await deleteTable(tableToDelete);
      if (ok) {
        notify(
          "success",
          translate("admin.tables.notifications.deleteSuccess")
        ); // Use translate
        setRefreshTrigger((p) => p + 1);
      }
    } catch (error) {
      console.error("Delete error:", error);
      notify("error", translate("admin.tables.notifications.deleteError")); // Use translate
    } finally {
      setShowConfirmDialog(false);
      setTableToDelete(null);
    }
  }, [tableToDelete, notify, translate]); // Update dependency

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {translate("admin.tables.title")} {/* Use translate */}
        </h1>
        <Button
          color="cyan"
          onClick={() => {
            setEditingTable(undefined);
            setShowFormModal(true);
          }}>
          <HiPlus className="mr-2 h-5 w-5" />
          {translate("admin.tables.addNewTable")} {/* Use translate */}
        </Button>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Filter bar */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <TextInput
              placeholder={translate("admin.tables.searchPlaceholder")} // Use translate
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
                    colors: {
                      gray: "!bg-white border-gray-300 !text-gray-900 !placeholder-gray-400 focus:!ring-cyan-500 focus:!border-cyan-500 cursor-text opacity-100",
                    },
                  },
                },
              }}
            />
          </div>

          <Select
            className="w-48"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            theme={{
              field: {
                select: {
                  base: "!bg-gray-50 !text-gray-700 !border-gray-300 focus:!ring-cyan-500 focus:!border-cyan-500",
                },
              },
            }}>
            <option value="">
              {translate("admin.tables.filters.allLocations")}
            </option>{" "}
            {/* Use translate */}
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
              </option>
            ))}
          </Select>

          <Select
            className="w-48"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            theme={{
              field: {
                select: {
                  base: "!bg-gray-50 !text-gray-700 !border-gray-300 focus:!ring-cyan-500 focus:!border-cyan-500",
                },
              },
            }}>
            <option value="">
              {translate("admin.tables.filters.allPositions")}
            </option>{" "}
            {/* Use translate */}
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code}
              </option>
            ))}
          </Select>

          <Select
            className="w-48"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            theme={{
              field: {
                select: {
                  base: "!bg-gray-50 !text-gray-700 !border-gray-300 focus:!ring-cyan-500 focus:!border-cyan-500",
                },
              },
            }}>
            <option value="">
              {translate("admin.tables.filters.allStatus")}
            </option>{" "}
            {/* Use translate */}
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </Select>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                <HiOutlineViewGrid className="inline mr-2" />{" "}
                {translate("admin.tables.tableHeaders.name")}{" "}
                {/* Use translate */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {translate("admin.tables.tableHeaders.location")}{" "}
                {/* Use translate */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {translate("admin.tables.tableHeaders.position")}{" "}
                {/* Use translate */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {translate("admin.tables.tableHeaders.capacity")}{" "}
                {/* Use translate */}
              </TableHeadCell>
              <TableHeadCell className="p-3 !bg-gray-50 text-gray-700">
                {translate("admin.tables.tableHeaders.status")}{" "}
                {/* Use translate */}
              </TableHeadCell>
              <TableHeadCell className="text-center p-3 !bg-gray-50 text-gray-700">
                {translate("admin.tables.tableHeaders.actions")}{" "}
                {/* Use translate */}
              </TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center bg-white text-gray-700 py-4">
                    {translate("admin.tables.tableMessages.loading")}{" "}
                    {/* Use translate */}
                  </TableCell>
                </TableRow>
              ) : tables.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center bg-white text-gray-700 py-4">
                    {translate("admin.tables.tableMessages.noTablesFound")}{" "}
                    {/* Use translate */}
                  </TableCell>
                </TableRow>
              ) : (
                tables.map((t) => (
                  <TableRow
                    key={t.id}
                    className="!bg-gray-50 hover:!bg-gray-100 transition-colors duration-150">
                    <TableCell className="p-3 bg-white text-gray-700">
                      {t.name}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      {t.locationName}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      {t.positionName}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      {t.capacity}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700">
                      <Badge
                        color={
                          t.statusName === "AVAILABLE"
                            ? "success"
                            : t.statusName === "OCCUPIED"
                            ? "red"
                            : "gray"
                        }>
                        {translate(`admin.tables.status.${t.statusName}`)}{" "}
                        {/* Use translate */}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center p-3 bg-white text-gray-700">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => {
                            setEditingTable(t);
                            setShowFormModal(true);
                          }}>
                          <HiPencil className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => handleDeleteTable(t.id)}>
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
        message={translate("admin.tables.confirmDialog.deleteMessage")} // Use translate
      />

      <TableFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={() => setRefreshTrigger((p) => p + 1)}
        tableData={editingTable}
      />
    </div>
  );
}

export default AdminTables;
