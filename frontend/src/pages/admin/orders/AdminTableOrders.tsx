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
import { ReservationDetailModal } from "../../../components/order/ReservationDetailModal";

export const AdminTableOrders = () => {
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
  const { notify } = useNotification();
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
      notify("error", "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchTerm,
    selectedStatus,
    fromDate,
    toDate,
    notify,
  ]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadStatuses = async (signal: AbortSignal) => {
      try {
        const res = await api.get("/params?type=STATUS_RESERVATION", {
          signal,
        });
        if (res.data?.data) setStatuses(res.data.data);
      } catch {
        if (!signal.aborted) notify("error", "Could not load order statuses.");
      }
    };
    void loadStatuses(abortController.signal);
    void fetchReservations();
  }, [notify, fetchReservations]);

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
    notify("success", "Reservation approved successfully!");
    setShowModal(false);
    fetchReservations();
  };

  const handleComplete = async (publicId: string) => {
    await api.put(`/reservations/${publicId}/complete`);
    notify("success", "Reservation completed successfully!");
    setShowModal(false);
    fetchReservations();
  };

  const handleCancel = async (publicId: string) => {
    await api.put(`/reservations/${publicId}/cancel`);
    notify("success", "Reservation cancelled successfully!");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Table Orders</h1>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative w-64">
            <TextInput
              placeholder="Search by customer or order code..."
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
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </Select>
          </div>
          {/* From Date */}
          <div>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={handleFromDateChange}
              className="border-gray-500 rounded-md !bg-gray-50 text-gray-700 focus:!ring-cyan-500 focus:!border-cyan-500"
            />
          </div>
          {/* To Date */}
          <div>
            <input
              type="datetime-local"
              value={toDate}
              onChange={handleToDateChange}
              className="border-gray-500 rounded-md !bg-gray-50 text-gray-700 focus:!ring-cyan-500 focus:!border-cyan-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow-sm rounded-md">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Reservation ID
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Customer
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Tables
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Time
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  People
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Status
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Action
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
              ) : reservations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center bg-white text-gray-700 py-4">
                    No reservations found
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
                      {res.tableNames.length > 2
                        ? `${res.tableNames.length} tables`
                        : res.tableNames.join(", ")}
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
                        Review
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
