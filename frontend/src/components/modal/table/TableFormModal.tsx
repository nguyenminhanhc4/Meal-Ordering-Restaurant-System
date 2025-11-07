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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    locationId: "",
    positionId: "",
    statusId: "",
  });

  const [errors, setErrors] = useState({
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

  const fetchParams = useCallback(async (type: string, signal: AbortSignal) => {
    try {
      const res = await axios.get(`/params?type=${type}`, { signal });
      return res.data.data || [];
    } catch (err) {
      console.error(`Error fetching ${type} params:`, err);
      return [];
    }
  }, []);

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
        notify("error", t("admin.tables.notifications.loadFormOptionsError"));
      }
    };
    void load();

    return () => abortController.abort();
  }, [show, fetchParams, notify, t]);

  useEffect(() => {
    if (tableData) {
      setFormData({
        name: tableData.name || "",
        capacity: String(tableData.capacity || ""),
        locationId: String(tableData.locationId || ""),
        positionId: String(tableData.positionId || ""),
        statusId: String(tableData.statusId || ""),
      });
      setErrors({
        name: "",
        capacity: "",
        locationId: "",
        positionId: "",
        statusId: "",
      });
    } else {
      setFormData({
        name: "",
        capacity: "",
        locationId: "",
        positionId: "",
        statusId: "",
      });
      setErrors({
        name: "",
        capacity: "",
        locationId: "",
        positionId: "",
        statusId: "",
      });
    }
  }, [tableData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      capacity: "",
      locationId: "",
      positionId: "",
      statusId: "",
    };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = t("admin.tables.form.errors.nameRequired");
      valid = false;
    }

    const cap = Number(formData.capacity);
    if (!formData.capacity || cap < 1 || cap > 10) {
      newErrors.capacity = t("admin.tables.form.errors.capacityRange");
      valid = false;
    }

    if (!formData.locationId) {
      newErrors.locationId = t("admin.tables.form.errors.locationRequired");
      valid = false;
    }
    if (!formData.positionId) {
      newErrors.positionId = t("admin.tables.form.errors.positionRequired");
      valid = false;
    }
    if (!formData.statusId) {
      newErrors.statusId = t("admin.tables.form.errors.statusRequired");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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
        notify("success", t("admin.tables.notifications.updateSuccess"));
      } else {
        await axios.post("/tables", payload);
        notify("success", t("admin.tables.notifications.createSuccess"));
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save table failed:", err);
      notify("error", t("admin.tables.notifications.saveError"));
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
            : t("admin.tables.form.createTitle")}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-6 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.name")}
              </Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("admin.tables.form.placeholders.name")}
                theme={{
                  field: {
                    input: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <Label
                htmlFor="capacity"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.capacity")}
              </Label>
              <TextInput
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                min={1}
                max={10}
                theme={{
                  field: {
                    input: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label
                htmlFor="statusId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.status")}
              </Label>
              <Select
                id="statusId"
                name="statusId"
                value={formData.statusId}
                onChange={handleChange}
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">
                  {t("admin.tables.form.placeholders.selectStatus")}
                </option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {t(`admin.tables.status.${st.code}`)}
                  </option>
                ))}
              </Select>
              {errors.statusId && (
                <p className="text-red-500 text-xs mt-1">{errors.statusId}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <Label
                htmlFor="locationId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.location")}
              </Label>
              <Select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">
                  {t("admin.tables.form.placeholders.selectLocation")}
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code}
                  </option>
                ))}
              </Select>
              {errors.locationId && (
                <p className="text-red-500 text-xs mt-1">{errors.locationId}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <Label
                htmlFor="positionId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.tables.form.labels.position")}
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
                </option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.code}
                  </option>
                ))}
              </Select>
              {errors.positionId && (
                <p className="text-red-500 text-xs mt-1">{errors.positionId}</p>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
          <Button color="gray" onClick={onClose}>
            {t("admin.tables.form.buttons.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                {t("admin.tables.form.buttons.saving")}
              </div>
            ) : tableData ? (
              t("admin.tables.form.buttons.update")
            ) : (
              t("admin.tables.form.buttons.create")
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
