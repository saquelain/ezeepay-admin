"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { createCategory, updateCategory } from "@/lib/api/category";
import { slugify } from "@/lib/utils/slugify";
import type { Category } from "@/lib/types/blog";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSaved: () => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryFormDialogProps) {
  const isEdit = !!category;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name || "");
      setSlug(category?.slug || "");
      setSlugTouched(isEdit);
      setDescription(category?.description || "");
      setError(null);
    }
  }, [open, category, isEdit]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  async function handleSave() {
    setError(null);

    if (!name || !slug) {
      setError("Name and slug are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && category) {
        await updateCategory(category._id, { name, slug, description });
      } else {
        await createCategory({ name, slug, description });
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-brand-purple-dark">
            {isEdit ? "Edit Category" : "New Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Banking & AePS"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              placeholder="banking-aeps"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="AePS, Micro ATM, and core banking services for retailers."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-purple-dark hover:bg-brand-purple"
          >
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}