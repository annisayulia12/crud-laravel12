import {
  XMarkIcon,
  FolderIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import { Button, Chip } from "@heroui/react";

export default function ProjectDetail({ project, onClose }) {
  if (!project) return null;

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getStatusChip = (status) => {
    if (!status) return null;

    const value = status.toLowerCase();

    // ACTIVE
    if (value === "active") {
      return (
        <Chip
          size="sm"
          variant="soft"
          className="bg-green-100 text-green-700 border border-green-200"
        >
          Active
        </Chip>
      );
    }

    // PENDING
    if (value === "pending") {
      return (
        <Chip
          size="sm"
          variant="soft"
          className="bg-red-100 text-red-700 border border-red-200"
        >
          Pending
        </Chip>
      );
    }

    // IN PROGRESS
    if (value === "in_progress" || value === "in progress") {
      return (
        <Chip
          size="sm"
          variant="soft"
          className="bg-orange-100 text-orange-700 border border-orange-200"
        >
          In Progress
        </Chip>
      );
    }

    // COMPLETED
    if (value === "completed") {
      return (
        <Chip
          size="sm"
          variant="soft"
          className="bg-blue-100 text-blue-700 border border-blue-200"
        >
          Completed
        </Chip>
      );
    }

    // ARCHIVED
    if (value === "archived") {
      return (
        <Chip
          size="sm"
          variant="soft"
          className="bg-violet-100 text-violet-700 border border-violet-200"
        >
          Archived
        </Chip>
      );
    }

    // DEFAULT
    return (
      <Chip
        size="sm"
        variant="soft"
        className="bg-gray-100 text-gray-700 border border-gray-200"
      >
        {status}
      </Chip>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FolderIcon className="size-6" />
            </div>

            <div>
              <h2
                id="project-detail-title"
                className="text-xl font-bold text-slate-900"
              >
                Project Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Detail informasi project kamu.
              </p>
            </div>
          </div>

          <Button
            isIconOnly
            variant="outline"
            aria-label="Close project details"
            onPress={onClose}
          >
            <XMarkIcon className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {getStatusChip(project.status)}

              <span className="text-xs text-slate-400">
                Project ID: #{project.id}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {project.name || "-"}
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {project.description || "Tidak ada deskripsi project."}
            </p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-900">
              Project Timeline
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDaysIcon className="size-5 text-indigo-600" />
                  <span className="text-sm">Start Date</span>
                </div>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(project.start_date)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDaysIcon className="size-5 text-rose-500" />
                  <span className="text-sm">Due Date</span>
                </div>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(project.due_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional information */}
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 text-center">
              Additional Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-6 text-center sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Created By</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {project.created_by?.name ||
                    project.created_by ||
                    project.creator?.name ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Status</p>
                <div className="mt-2">{getStatusChip(project.status)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 p-5 sm:px-6">
          <Button variant="outline" onPress={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
