import {
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  Spinner,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import React, { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";
import { useNotification } from "../../components/Notification";
import type { TableEntity } from "../../services/table/tableService";

interface TableFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableData?: TableEntity;
}

interface OptionType {
  id: number;
  code: string;
  name: string;
}

export const TableFormModal: React.FC<TableFormModalProps> = ({
  show,
  onClose,
  onSuccess,
  tableData,
}) => {
  const { notify } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    locationId: "",
    positionId: "",
    statusId: "",
  });

  const [locations, setLocations] = useState<OptionType[]>([]);
  const [positions, setPositions] = useState<OptionType[]>([]);
  const [statuses, setStatuses] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  // ⚙️ Hàm load options từ BE (memoized)
  const fetchParams = useCallback(async (type: string, signal: AbortSignal) => {
    try {
      const res = await axios.get(`/params?type=${type}`, { signal });
      return res.data.data || [];
    } catch (err) {
      console.error(`Error fetching ${type} params:`, err);
      return [];
    }
  }, []);

  // 🔄 Khi mở modal => load options (nếu chưa có)
  useEffect(() => {
    if (!show) return;

    const abortController = new AbortController();
    const load = async () => {
      try {
        const [locs, pos, sts] = await Promise.all([
          fetchParams("LOCATION", abortController.signal),
          fetchParams("POSITION", abortController.signal),
          fetchParams("STATUS_TABLE", abortController.signal),
        ]);
        setLocations(locs);
        setPositions(pos);
        setStatuses(sts);
      } catch {
        notify("error", "Failed to load form options");
      }
    };
    void load();

    return () => abortController.abort();
  }, [show, fetchParams, notify]);

  // ✳️ Khi edit thì set sẵn dữ liệu
  useEffect(() => {
    if (tableData) {
      setFormData({
        name: tableData.name || "",
        capacity: String(tableData.capacity || ""),
        locationId: String(tableData.locationId || ""),
        positionId: String(tableData.positionId || ""),
        statusId: String(tableData.statusId || ""),
      });
    } else {
      setFormData({
        name: "",
        capacity: "",
        locationId: "",
        positionId: "",
        statusId: "",
      });
    }
  }, [tableData]);

  // 📝 Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify("error", "Table name is required");
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      notify("error", "Capacity must be a positive number");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        capacity: Number(formData.capacity),
        locationId: Number(formData.locationId),
        positionId: Number(formData.positionId),
        statusId: Number(formData.statusId),
      };

      if (tableData) {
        await axios.put(`/tables/${tableData.id}`, payload);
        notify("success", "Table updated successfully");
      } else {
        await axios.post("/tables", payload);
        notify("success", "Table created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save table failed:", err);
      notify("error", "Failed to save table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="3xl"
      className="shadow-lg z-[60]">
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-lg font-bold text-gray-800">
          {tableData ? "Edit Table" : "Create Table"}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-6 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium !text-gray-700">
                Table Name
              </Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Table A1"
                theme={{
                  field: {
                    input: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="capacity"
                className="mb-2 block text-sm font-medium !text-gray-700">
                Capacity
              </Label>
              <TextInput
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                min={1}
                required
                theme={{
                  field: {
                    input: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="statusId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                Status
              </Label>
              <Select
                id="statusId"
                name="statusId"
                value={formData.statusId}
                onChange={handleChange}
                required
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">Select status</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.code}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                htmlFor="locationId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                Location
              </Label>
              <Select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                htmlFor="positionId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                Position
              </Label>
              <Select
                id="positionId"
                name="positionId"
                value={formData.positionId}
                onChange={handleChange}
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">Select position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light /> Saving...
              </div>
            ) : tableData ? (
              "Update Table"
            ) : (
              "Create Table"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
