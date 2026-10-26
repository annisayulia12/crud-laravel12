import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  Calendar,
  Description,
  Spinner,
} from "@heroui/react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import {
  XMarkIcon,
  FolderPlusIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

const statusOptions = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
];

const emptyProject = {
  name: "",
  description: "",
  status: "",
  start_date: "",
  due_date: "",
};

const toDateString = (date) => {
  if (!date) return "";
  return String(date).slice(0, 10);
};

const toCalendarDate = (date) => {
  const value = toDateString(date);
  if (!value) return null;

  try {
    return parseDate(value);
  } catch {
    return null;
  }
};

export default function ProjectForm({ projectId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [project, setProject] = useState(emptyProject);
  const { setNotification } = useStateContext();

  const now = today(getLocalTimeZone());
  const maxDueDate = now.add({ months: 3 });

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      setErrors({});

      if (!projectId) {
        setProject({ ...emptyProject });
        return;
      }

      setLoading(true);

      try {
        const { data } = await axiosClient.get(`/project/${projectId}`);
        const result = data.data ?? data;

        if (cancelled) return;

        setProject({
          name: result.name ?? "",
          description: result.description ?? "",
          status: result.status ?? "",
          start_date: toDateString(result.start_date),
          due_date: toDateString(result.due_date),
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch project:", err);
        setNotification("Gagal mengambil data project");
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const updateField = (field, value) => {
    setProject((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const payload = {
      name: project.name.trim(),
      description: project.description,
      status: project.status,
      start_date: project.start_date || null,
      due_date: project.due_date || null,
    };

    try {
      if (projectId) {
        await axiosClient.put(`/project/${projectId}`, payload);
      } else {
        await axiosClient.post("/project", payload);
      }

      setNotification(
        projectId
          ? "Project berhasil diperbarui"
          : "Project berhasil ditambahkan",
      );

      onClose(true);
    } catch (err) {
      const response = err.response;

      if (response?.status === 422) {
        setErrors(response.data.errors ?? {});
      } else {
        setErrors({
          general: [
            response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.",
          ],
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (field) => {
    const value = errors[field];
    if (!value) return null;

    const message = Array.isArray(value) ? value[0] : value;

    return <p className="mt-1 text-sm text-red-600">{message}</p>;
  };

  const renderCalendar = (field, label, options = {}) => {
    const selectedDate = toCalendarDate(project[field]);

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
          <Calendar
            aria-label={label}
            value={selectedDate}
            minValue={options.minValue}
            maxValue={options.maxValue}
            onChange={(date) => updateField(field, date?.toString() ?? "")}
          >
            <Calendar.Header>
              <Calendar.NavButton slot="previous" />
              <Calendar.Heading />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>

            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => (
                  <Calendar.HeaderCell key={day}>{day}</Calendar.HeaderCell>
                )}
              </Calendar.GridHeader>

              <Calendar.GridBody>
                {(date) => <Calendar.Cell key={date.toString()} date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </div>

        <p className="text-xs text-slate-500">
          {selectedDate
            ? `Tanggal dipilih: ${selectedDate.toString()}`
            : "Pilih tanggal pada kalender."}
        </p>

        {fieldError(field)}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FolderPlusIcon className="size-6" />
            </div>

            <div>
              <h2
                id="project-form-title"
                className="text-lg font-bold text-slate-900"
              >
                {projectId ? "Edit Project" : "Add New Project"}
              </h2>
              <p className="text-sm text-slate-500">
                {projectId
                  ? "Perbarui informasi project."
                  : "Lengkapi informasi project baru."}
              </p>
            </div>
          </div>

          <Button
            isIconOnly
            variant="outline"
            aria-label="Close form"
            onPress={() => onClose()}
            isDisabled={saving}
          >
            <XMarkIcon className="size-5" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
              <Spinner size="sm" />
              Loading project...
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              {errors.general?.map((message, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
                >
                  {message}
                </div>
              ))}

              {/* Project Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FolderPlusIcon className="size-4 text-indigo-500" />
                  Project Name <span className="text-danger">*</span>
                </Label>

                <Input
                  aria-label="Project name"
                  placeholder="Enter project name"
                  value={project.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  className="w-full"
                />
                {fieldError("name")}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <DocumentTextIcon className="size-4 text-indigo-500" />
                  Description
                </Label>

                <TextArea
                  aria-label="Project description"
                  placeholder="Write a description for your project..."
                  value={project.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-32 w-full"
                />

                <p className="text-xs text-slate-400">
                  Jelaskan tujuan atau detail project secara singkat.
                </p>

                {fieldError("description")}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FlagIcon className="size-4 text-indigo-500" />
                  Status <span className="text-danger">*</span>
                </Label>

                <Select
                  aria-label="Project status"
                  placeholder="Select project status"
                  selectedKey={project.status || null}
                  onSelectionChange={(key) =>
                    updateField("status", key?.toString() ?? "")
                  }
                  className="w-full"
                  required
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>

                  <Select.Popover>
                    <ListBox>
                      {statusOptions.map((option) => (
                        <ListBox.Item
                          key={option.id}
                          id={option.id}
                          textValue={option.label}
                        >
                          {option.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                {fieldError("status")}
              </div>

              {/* Dates */}
              <div className="space-y-5">
                <Label className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-800">
                  <CalendarDaysIcon className="size-5 text-indigo-600" />
                  Project Schedule
                </Label>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {renderCalendar("start_date", "Start Date")}

                  {renderCalendar("due_date", "Due Date", {
                    minValue: now,
                    maxValue: maxDueDate,
                  })}
                </div>

                <Description className="text-xs text-slate-500">
                  Due Date hanya dapat dipilih dari hari ini hingga tiga bulan
                  ke depan.
                </Description>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => onClose()}
                  isDisabled={saving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  isDisabled={saving}
                  className="w-full bg-indigo-600 font-semibold text-white sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" color="current" />
                      Saving...
                    </>
                  ) : projectId ? (
                    "Update Project"
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
