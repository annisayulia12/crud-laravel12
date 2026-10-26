import { useState, useEffect } from "react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { Button, SearchField, Table } from "@heroui/react";

import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import UserForm from "./UserForm";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const { setNotification } = useStateContext();

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = (page = 1) => {
    setLoading(true);

    axiosClient
      .get(`/users?page=${page}`)
      .then(({ data }) => {
        setUsers(data.data ?? []);

        setPagination({
          current_page: data.meta?.current_page ?? page,
          last_page: data.meta?.last_page ?? 1,
          per_page: data.meta?.per_page ?? 15,
          total: data.meta?.total ?? 0,
          from: data.meta?.from ?? 0,
          to: data.meta?.to ?? 0,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setNotification("Failed to load users.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`,
    );

    if (!confirmed) return;

    setDeletingId(user.id);

    try {
      await axiosClient.delete(`/users/${user.id}`);
      setNotification("User was successfully deleted");

      const currentPage = pagination.current_page;
      getUsers(currentPage);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setNotification(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setSelectedUserId(null);
    setShowUserModal(true);
  };

  const openEditModal = (id) => {
    setSelectedUserId(id);
    setShowUserModal(true);
  };

  const closeUserModal = (shouldRefresh = false) => {
    setShowUserModal(false);
    setSelectedUserId(null);

    if (shouldRefresh) {
      getUsers(pagination.current_page);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase().trim();

    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
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

  return (
    <>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <UsersIcon className="size-4" />
              Management / Users
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage user accounts and their information.
            </p>
          </div>

          <Button
            color="primary"
            onPress={openAddModal}
            startContent={<PlusIcon className="size-5" />}
            className="w-full bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-100 sm:w-auto"
          >
            Add New User
          </Button>
        </div>

        {/* User summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pagination.total}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Registered accounts
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UsersIcon className="size-6" />
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
                  {filteredUsers.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Users matching your search
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <MagnifyingGlassIcon className="size-6" />
              </div>
            </div>
          </div>
        </div>

        {/* User table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-semibold text-slate-900">User Directory</h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all registered users.
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
                    placeholder="Search name or email..."
                  />

                  <SearchField.SearchIcon className="h-4 w-4 text-gray-400" />
                </SearchField.Group>
              </SearchField>

              <Button
                variant="bordered"
                isIconOnly
                aria-label="Refresh projects"
                onPress={getUsers}
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
                  aria-label="User list table"
                  className="min-w-180"
                >
                  <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                    <Table.Column
                      id="number"
                      className="text-center"
                      isRowHeader
                    >
                      No.
                    </Table.Column>
                    <Table.Column id="user" className="text-center">
                      User
                    </Table.Column>
                    <Table.Column id="email" className="text-center">
                      Email Address
                    </Table.Column>
                    <Table.Column id="createdDate" className="text-center">
                      Created Date
                    </Table.Column>
                    <Table.Column id="actions" className="text-center">
                      Actions
                    </Table.Column>
                  </Table.Header>

                  <Table.Body
                    items={loading ? [{ id: "__loading__" }] : filteredUsers}
                    renderEmptyState={() => (
                      <div className="py-10 text-center text-sm text-slate-500">
                        {search
                          ? "User tidak ditemukan."
                          : "Belum ada data user."}
                      </div>
                    )}
                  >
                    {(user) =>
                      user.id === "__loading__" ? (
                        <Table.Row id="loading">
                          <Table.Cell colSpan={5}>
                            <div className="flex items-center justify-center gap-3 py-4">
                              <ArrowPathIcon className="size-5 animate-spin text-indigo-600" />
                              <span className="text-sm text-slate-500">
                                Loading...
                              </span>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        <Table.Row id={user.id}>
                          <Table.Cell>
                            <span className="text-sm font-medium text-slate-500">
                              {filteredUsers.findIndex(
                                (item) => item.id === user.id,
                              ) + 1}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="flex items-center gap-3 py-2">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </div>

                              <span className="font-medium text-slate-800">
                                {user.name}
                              </span>
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <span className="text-sm text-slate-500">
                              {user.email}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <span className="whitespace-nowrap text-sm text-slate-500">
                              {formatDate(user.created_at)}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                aria-label={`Edit ${user.name}`}
                                onPress={() => openEditModal(user.id)}
                              >
                                <PencilSquareIcon className="size-4 text-yellow-500" />
                              </Button>

                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                aria-label={`Delete ${user.name}`}
                                isDisabled={deletingId === user.id}
                                isLoading={deletingId === user.id}
                                onPress={() => onDelete(user)}
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

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {pagination.from}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {pagination.to}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {pagination.total}
              </span>{" "}
              users
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <Button
                variant="bordered"
                size="sm"
                startContent={<ChevronLeftIcon className="size-4" />}
                isDisabled={loading || pagination.current_page <= 1}
                onPress={() => getUsers(pagination.current_page - 1)}
              >
                Previous
              </Button>

              <span className="whitespace-nowrap text-sm text-slate-600">
                Page{" "}
                <span className="font-semibold text-slate-900">
                  {pagination.current_page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {pagination.last_page}
                </span>
              </span>

              <Button
                variant="bordered"
                size="sm"
                endContent={<ChevronRightIcon className="size-4" />}
                isDisabled={
                  loading || pagination.current_page >= pagination.last_page
                }
                onPress={() => getUsers(pagination.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>

      {showUserModal && (
        <UserForm userId={selectedUserId} onClose={closeUserModal} />
      )}
    </>
  );
}
