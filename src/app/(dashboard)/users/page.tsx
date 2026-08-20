"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { getAllUsers, deleteUser } from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth.store";
import { formatDate } from "@/lib/utils/format";
import type { ManagedUser } from "@/lib/types/auth";

const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    try {
      setUsers(await getAllUsers());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function openEdit(user: ManagedUser) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-purple-dark">Users</h1>
          <p className="mt-1 text-sm text-brand-grey">
            {users.length} user{users.length !== 1 && "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-brand-purple-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-purple"
        >
          <Plus size={16} />
          New User
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-purple" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-purple-light/40 hover:bg-brand-purple-light/40">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user._id === currentUser?.id;
                return (
                  <TableRow key={user._id} className="hover:bg-brand-purple-light/20">
                    <TableCell className="font-medium text-brand-purple-dark">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-brand-grey">
                          (you)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-brand-grey">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ROLE_COLORS[user.role]
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-brand-grey">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-purple transition-colors hover:bg-brand-purple-light"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={isSelf || deletingId === user._id}
                          title={isSelf ? "You cannot delete your own account" : undefined}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-30"
                        >
                          {deletingId === user._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSaved={loadUsers}
      />
    </div>
  );
}