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
import axios from "../../../api/axios";
import { useTranslation } from "react-i18next"; // Thêm useTranslation
import { useNotification } from "../../Notification";
import type { TableEntity } from "../../../services/table/tableService";

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
  const { t } = useTranslation(); // Thêm hook useTranslation
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
        notify("error", t("admin.tables.notifications.loadFormOptionsError")); // Sử dụng i18n
      }
    };
    void load();

    return () => abortController.abort();
  }, [show, fetchParams, notify, t]); // Thêm t vào dependencies

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
      notify("error", t("admin.tables.notifications.nameRequiredError")); // Sử dụng i18n
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      notify("error", t("admin.tables.notifications.capacityInvalidError")); // Sử dụng i18n
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
        notify("success", t("admin.tables.notifications.updateSuccess")); // Sử dụng i18n
      } else {
        await axios.post("/tables", payload);
        notify("success", t("admin.tables.notifications.createSuccess")); // Sử dụng i18n
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save table failed:", err);
      notify("error", t("admin.tables.notifications.saveError")); // Sử dụng i18n
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
          {tableData
            ? t("admin.tables.form.editTitle")
            : t("admin.tables.form.createTitle")}{" "}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-6 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.name")} {/* Sử dụng i18n */}
              </Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t("admin.tables.form.placeholders.name")} // Sử dụng i18n
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
                {t("admin.tables.form.labels.capacity")} {/* Sử dụng i18n */}
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
                {t("admin.tables.form.labels.status")} {/* Sử dụng i18n */}
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
                <option value="">
                  {t("admin.tables.form.placeholders.selectStatus")}
                </option>{" "}
                {/* Sử dụng i18n */}
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {t(`admin.tables.status.${st.code}`)} {/* Sử dụng i18n */}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                htmlFor="locationId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.location")} {/* Sử dụng i18n */}
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
                <option value="">
                  {t("admin.tables.form.placeholders.selectLocation")}
                </option>{" "}
                {/* Sử dụng i18n */}
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code} {/* Giữ nguyên hoặc dịch nếu cần */}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                htmlFor="positionId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.position")} {/* Sử dụng i18n */}
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
                <option value="">
                  {t("admin.tables.form.placeholders.selectPosition")}
                </option>{" "}
                {/* Sử dụng i18n */}
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.code} {/* Giữ nguyên hoặc dịch nếu cần */}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
          <Button color="gray" onClick={onClose}>
            {t("admin.tables.form.buttons.cancel")} {/* Sử dụng i18n */}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                {t("admin.tables.form.buttons.saving")} {/* Sử dụng i18n */}
              </div>
            ) : tableData ? (
              t("admin.tables.form.buttons.update") // Sử dụng i18n
            ) : (
              t("admin.tables.form.buttons.create") // Sử dụng i18n
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
