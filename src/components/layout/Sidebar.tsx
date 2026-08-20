"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderKanban, LogOut, PanelLeftClose, PanelLeft, Users } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useSidebarStore } from "@/lib/store/sidebar.store";

const NAV_ITEMS = [
  { label: "Blog Posts", href: "/blog", icon: FileText },
  { label: "Categories", href: "/categories", icon: FolderKanban },
  { label: "Users", href: "/users", icon: Users, superadminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={`flex h-screen flex-col border-r border-brand-purple/10 bg-white transition-all ${
        isCollapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-brand-purple/10 px-4 py-5">
        {!isCollapsed && (
          <span className="text-lg font-extrabold text-brand-purple-dark">
            Ezeepay <span className="text-brand-orange">Admin</span>
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-grey transition-colors hover:bg-brand-purple-light hover:text-brand-purple-dark"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.filter(
          (item) => !item.superadminOnly || user?.role === "superadmin"
        ).map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-purple-dark text-white"
                  : "text-brand-grey hover:bg-brand-purple-light hover:text-brand-purple-dark"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-purple/10 p-3">
        {!isCollapsed && user && (
          <div className="mb-2 px-3 py-1.5">
            <p className="truncate text-sm font-semibold text-brand-purple-dark">
              {user.name}
            </p>
            <p className="truncate text-xs text-brand-grey">{user.role}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && "Log Out"}
        </button>
      </div>
    </aside>
  );
}