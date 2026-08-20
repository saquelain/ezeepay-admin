"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import {
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "@/lib/api/category";
import type { Category } from "@/lib/types/blog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );

  async function loadCategories() {
    setIsLoading(true);
    try {
      const result = await getAllCategories();
      setCategories([...result].sort((a, b) => a.order - b.order));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This only works if no blog posts use it.`))
      return;

    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    setReorderingId(current._id);
    try {
      // Swap their `order` values on the backend
      await Promise.all([
        updateCategory(current._id, { order: target.order }),
        updateCategory(target._id, { order: current.order }),
      ]);

      const next = [...categories];
      next[index] = { ...target, order: current.order };
      next[targetIndex] = { ...current, order: target.order };
      next.sort((a, b) => a.order - b.order);
      setCategories(next);
    } catch {
      alert("Failed to reorder. Please try again.");
    } finally {
      setReorderingId(null);
    }
  }

  function openCreate() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Categories
          </h1>
          <p className="mt-1 text-sm text-brand-grey">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-brand-purple-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-purple"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-purple" />
          </div>
        ) : categories.length === 0 ? (
          <p className="py-16 text-center text-brand-grey">
            No categories yet. Create your first one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-purple-light/40 hover:bg-brand-purple-light/40">
                <TableHead className="w-20">Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow
                  key={category._id}
                  className="hover:bg-brand-purple-light/20"
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0 || reorderingId !== null}
                        className="flex h-5 w-5 items-center justify-center rounded text-brand-grey hover:bg-brand-purple-light disabled:opacity-20"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={
                          index === categories.length - 1 ||
                          reorderingId !== null
                        }
                        className="flex h-5 w-5 items-center justify-center rounded text-brand-grey hover:bg-brand-purple-light disabled:opacity-20"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-brand-purple-dark">
                    {category.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-brand-grey">
                    /{category.slug}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-brand-grey">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-purple transition-colors hover:bg-brand-purple-light"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category._id, category.name)}
                        disabled={deletingId === category._id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === category._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSaved={loadCategories}
      />
    </div>
  );
}