import { useEffect, useState, useCallback } from "react";
import {
  Button,
  TextInput,
  Card,
  Select,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableHeadCell,
  Badge,
} from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { useNotification } from "../../../components/Notification";
import { Pagination } from "../../../components/common/Pagination";
import { format } from "date-fns";
import { getReservations } from "../../../services/reservation/reservationService";
import type {
  ReservationDTO,
  ReservationFilter,
} from "../../../services/reservation/reservationService";
import { AxiosError } from "axios";
import api from "../../../api/axios";
import { ReservationDetailModal } from "../../../components/modal/order/ReservationDetailModal";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate";
import { useTranslation } from "react-i18next"; // <-- added

export const AdminTableOrders = () => {
  const { t } = useTranslation(); // <-- i18n hook
  const { notify } = useNotification();

  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");
  const [statuses, setStatuses] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const filter: ReservationFilter = {
        keyword: searchTerm || undefined,
        statusId: selectedStatus ? Number(selectedStatus) : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      };
      const data = await getReservations(filter, currentPage - 1, pageSize);
      if (data) {
        setReservations(data.content);
        setTotalPages(data.totalPages ?? 1);
        setTotalItems(data.totalElements ?? 0);
      } else {
        setReservations([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("Axios error:", err.response?.data);
      } else {
        console.error(err);
      }
      notify("error", t("admin.reservations.notifications.loadError"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatus, fromDate, toDate, t, notify]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadStatuses = async (signal: AbortSignal) => {
      try {
        const res = await api.get("/params?type=STATUS_RESERVATION", {
          signal,
        });
        if (res.data?.data) setStatuses(res.data.data);
      } catch {
        if (!signal.aborted)
          notify(
            "error",
            t("admin.reservations.notifications.loadStatusesError")
          );
      }
    };

    void loadStatuses(abortController.signal);
    void fetchReservations();

    return () => abortController.abort();
  }, [notify, fetchReservations, t]);

  useRealtimeUpdate<void, string, { reservationPublicId: string }>(
    "/topic/reservations",
    async () => {
      await fetchReservations();
    },
    () => {
      void fetchReservations();
    },
    (msg) => msg.reservationPublicId
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value ? Number(e.target.value) : "");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const formatDateTime = (iso: string) =>
    format(new Date(iso), "dd/MM/yyyy HH:mm");

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
    setCurrentPage(1);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
    setCurrentPage(1);
  };

  const handleView = (res: ReservationDTO) => {
    setSelectedReservation(res);
    setShowModal(true);
  };

  const handleApprove = async (publicId: string) => {
    await api.put(`/reservations/${publicId}/approve`);
    notify("success", t("admin.reservations.notifications.approveSuccess"));
    setShowModal(false);
    fetchReservations();
  };

  const handleComplete = async (publicId: string) => {
    await api.put(`/reservations/${publicId}/complete`);
    notify("success", t("admin.reservations.notifications.completeSuccess"));
    setShowModal(false);
    fetchReservations();
  };

  const handleCancel = async (publicId: string) => {
    await api.put(`/reservations/${publicId}/cancel`);
    notify("success", t("admin.reservations.notifications.cancelSuccess"));
    setShowModal(false);
    fetchReservations();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "success";
      case "CANCELLED":
        return "failure";
      case "COMPLETED":
        return "info";
      default:
        return "gray";
    }
  };

  // Format table names: "3 tables" or "A1, A2"
  const formatTableNames = (tableNames: string[]) => {
    if (tableNames.length > 2) {
      return t("admin.reservations.tableCount", { count: tableNames.length });
    }
    return t("admin.reservations.tableList", { tables: tableNames.join(", ") });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.reservations.title")}
        </h1>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Filters */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {/* Search */}
          <div className="relative w-64">
            <TextInput
              placeholder={t("admin.reservations.searchPlaceholder")}
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

          {/* Status Filter */}
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
              <option value="">{t("admin.reservations.statusAll")}</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </Select>
          </div>

          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">
              {t("admin.reservations.fromDateLabel")}:
            </label>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={handleFromDateChange}
              className="border-gray-500 rounded-md !bg-gray-50 text-gray-700 focus:!ring-cyan-500 focus:!border-cyan-500 px-2 py-1"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">
              {t("admin.reservations.toDateLabel")}:
            </label>
            <input
              type="datetime-local"
              value={toDate}
              onChange={handleToDateChange}
              className="border-gray-500 rounded-md !bg-gray-50 text-gray-700 focus:!ring-cyan-500 focus:!border-cyan-500 px-2 py-1"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow-sm rounded-md">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.reservationId")}
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.customer")}
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.tables")}
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.time")}
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.people")}
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.status")}
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  {t("admin.reservations.table.action")}
                </TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.reservations.loading")}
                  </TableCell>
                </TableRow>
              ) : reservations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center bg-white text-gray-700 py-4">
                    {t("admin.reservations.noReservations")}
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow
                    key={res.publicId}
                    className="!bg-gray-50 hover:!bg-gray-100 transition-colors duration-150">
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      {res.publicId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      {res.userName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      {formatTableNames(res.tableNames)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      {formatDateTime(res.reservationTime)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      {res.numberOfPeople}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      <Badge color={getStatusBadgeColor(res.statusName)}>
                        {res.statusName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => handleView(res)}>
                        {t("admin.reservations.reviewButton")}
                      </Button>
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
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <ReservationDetailModal
        show={showModal}
        onClose={() => setShowModal(false)}
        reservation={selectedReservation}
        onApprove={handleApprove}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};
