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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createUser, updateUser } from "@/lib/api/users";
import type { ManagedUser, UserRole } from "@/lib/types/auth";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ManagedUser | null;
  onSaved: () => void;
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: UserFormDialogProps) {
  const isEdit = !!user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPassword("");
      setRole(user?.role || "editor");
      setError(null);
    }
  }, [open, user]);

  async function handleSave() {
    setError(null);

    if (!name || !email || (!isEdit && !password)) {
      setError("Name, email, and password are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && user) {
        const payload: Record<string, string> = { name, email, role };
        if (password) payload.password = password;
        await updateUser(user._id, payload);
      } else {
        await createUser({ name, email, password, role });
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
            {isEdit ? "Edit User" : "New User"}
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
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              {isEdit ? "New Password (leave blank to keep current)" : "Password"}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "••••••••" : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
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
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}