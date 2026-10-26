import { useEffect, useState } from "react";

import {
  PlusIcon,
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

import { Button, SearchField, Chip, Table } from "@heroui/react";

import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import ProjectForm from "./ProjectForm";
import ProjectDetail from "./ProjectDetail";

export default function Project() {
  const [project, setProject] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [detailProject, setDetailProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const { setNotification } = useStateContext();

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = () => {
    setLoading(true);

    axiosClient
      .get("/project")
      .then(({ data }) => {
        setProject(
          Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [],
        );
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setNotification("Gagal mengambil data project");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDelete = async (p) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${p.name}?`,
    );

    if (!confirmed) return;

    setDeletingId(p.id);

    try {
      await axiosClient.delete(`/project/${p.id}`);

      setNotification("Project was successfully deleted");
      getProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setNotification(err.response?.data?.message || "Gagal menghapus project");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setSelectedProjectId(null);
    setShowProjectModal(true);
  };

  const openEditModal = (id) => {
    setSelectedProjectId(id);
    setShowProjectModal(true);
  };

  const closeProjectModal = (shouldRefresh = false) => {
    setShowProjectModal(false);
    setSelectedProjectId(null);

    if (shouldRefresh) {
      getProjects();
    }
  };

  const filteredProjects = project.filter((p) => {
    const keyword = search.toLowerCase().trim();

    return (
      p.name?.toLowerCase().includes(keyword) ||
      p.description?.toLowerCase().includes(keyword) ||
      p.status?.toLowerCase().includes(keyword)
    );
  });

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
    <>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <FolderIcon className="size-4" />
              Management / Projects
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Projects
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your projects, deadlines, and progress.
            </p>
          </div>

          <Button
            color="primary"
            onPress={openAddModal}
            startContent={<PlusIcon className="size-5" />}
            className="w-full bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-100 sm:w-auto"
          >
            Add New Project
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Projects
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {project.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All registered projects
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FolderIcon className="size-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Search Results
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {filteredProjects.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Projects matching your search
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <MagnifyingGlassIcon className="size-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Project table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Project Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all your projects.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <SearchField
                name="search"
                value={search}
                onChange={setSearch}
                className="w-full sm:w-64"
              >
                <SearchField.Group className="h-9 w-full rounded-lg border-slate-200 border px-3">
                  <SearchField.Input
                    className="w-full text-xs"
                    placeholder="Search name, description, or status..."
                  />

                  <SearchField.SearchIcon className="h-4 w-4 text-gray-400" />
                </SearchField.Group>
              </SearchField>

              <Button
                variant="bordered"
                isIconOnly
                aria-label="Refresh projects"
                onPress={getProjects}
                isDisabled={loading}
                className="shrink-0 self-end sm:self-auto"
              >
                <ArrowPathIcon
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <Table.ScrollContainer className="max-h-150 overflow-auto">
                <Table.Content
                  aria-label="Project list table"
                  className="min-w-225"
                >
                  <Table.Header className="sticky top-0 z-10 bg-surface-secondary text-center">
                    <Table.Column id="number" isRowHeader>
                      No.
                    </Table.Column>
                    <Table.Column id="project" className="text-center">
                      Project
                    </Table.Column>
                    <Table.Column id="status" className="text-center">
                      Status
                    </Table.Column>
                    <Table.Column id="startDate" className="text-center">
                      Start Date
                    </Table.Column>
                    <Table.Column id="dueDate" className="text-center">
                      Due Date
                    </Table.Column>
                    <Table.Column id="createdBy" className="text-center">
                      Created By
                    </Table.Column>
                    <Table.Column id="actions" className="text-center">
                      Actions
                    </Table.Column>
                  </Table.Header>

                  <Table.Body
                    items={loading ? [{ id: "__loading__" }] : filteredProjects}
                    renderEmptyState={() => (
                      <div className="py-10 text-center text-sm text-slate-500">
                        {search
                          ? "Project tidak ditemukan."
                          : "Belum ada data project."}
                      </div>
                    )}
                  >
                    {(p) =>
                      p.id === "__loading__" ? (
                        <Table.Row id="loading">
                          <Table.Cell colSpan={7}>
                            <div className="flex items-center justify-center gap-3 py-4">
                              <ArrowPathIcon className="size-5 animate-spin text-indigo-600" />
                              <span className="text-sm text-slate-500">
                                Loading...
                              </span>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        <Table.Row id={p.id}>
                          <Table.Cell>
                            <span className="text-sm font-medium text-slate-500">
                              {filteredProjects.findIndex(
                                (item) => item.id === p.id,
                              ) + 1}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="max-w-[320px] whitespace-normal wrap-break-word py-2">
                              <p className="font-semibold text-slate-800">
                                {p.name || "-"}
                              </p>

                              <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-5 text-slate-500">
                                {p.description || "Tidak ada deskripsi"}
                              </p>
                            </div>
                          </Table.Cell>

                          <Table.Cell>{getStatusChip(p.status)}</Table.Cell>

                          <Table.Cell>
                            <span className="whitespace-nowrap text-sm text-slate-600">
                              {formatDate(p.start_date)}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <span className="whitespace-nowrap text-sm text-slate-600">
                              {formatDate(p.due_date)}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <span className="text-sm text-slate-600">
                              {p.created_by || "-"}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="default"
                                aria-label={`Detail ${p.name}`}
                                onPress={() => setDetailProject(p)}
                              >
                                <EyeIcon className="size-4 text-blue-500" />
                              </Button>

                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="primary"
                                aria-label={`Edit ${p.name}`}
                                onPress={() => openEditModal(p.id)}
                              >
                                <PencilSquareIcon className="size-4 text-yellow-500" />
                              </Button>

                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="danger"
                                aria-label={`Delete ${p.name}`}
                                isDisabled={deletingId === p.id}
                                isLoading={deletingId === p.id}
                                onPress={() => onDelete(p)}
                              >
                                <TrashIcon className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      )
                    }
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </div>

          <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredProjects.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {project.length}
              </span>{" "}
              projects
            </p>
          </div>
        </section>
      </div>

      {detailProject && (
        <ProjectDetail
          project={detailProject}
          onClose={() => setDetailProject(null)}
        />
      )}

      {showProjectModal && (
        <ProjectForm
          projectId={selectedProjectId}
          onClose={closeProjectModal}
        />
      )}
    </>
  );
}
