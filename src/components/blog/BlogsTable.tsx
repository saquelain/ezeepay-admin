"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { BlogPost } from "@/lib/types/blog";
import { formatDate } from "@/lib/utils/format";

const CATEGORY_COLORS: Record<string, string> = {
  "banking-aeps": "bg-purple-100 text-purple-700",
  "upi-payments": "bg-blue-100 text-blue-700",
  insurance: "bg-orange-100 text-orange-700",
  "travel-services": "bg-green-100 text-green-700",
  "government-schemes": "bg-yellow-100 text-yellow-700",
};

type BlogsTableProps = {
  blogs: BlogPost[];
  isLoading: boolean;
  deletingId: string | null;
  onDelete: (id: string, title: string) => void;
};

export function BlogsTable({
  blogs,
  isLoading,
  deletingId,
  onDelete,
}: BlogsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <p className="py-16 text-center text-brand-grey">
        No blog posts yet. Create your first one.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-brand-purple-light/40 hover:bg-brand-purple-light/40">
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Read Time</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Published</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blogs.map((blog) => {
          const categorySlug =
            typeof blog.category === "object" ? blog.category.slug : "";
          const categoryName =
            typeof blog.category === "object" ? blog.category.name : "—";

          return (
            <TableRow key={blog._id} className="hover:bg-brand-purple-light/20">
              <TableCell className="max-w-[260px]">
                <p className="truncate font-medium text-brand-purple-dark">
                  {blog.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-brand-grey">
                  {blog.excerpt}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-brand-grey/70">
                  /{blog.slug}
                </p>
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    CATEGORY_COLORS[categorySlug] ??
                    "bg-brand-purple-light text-brand-purple"
                  }`}
                >
                  {categoryName}
                </span>
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    blog.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex max-w-[160px] flex-wrap gap-1">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-brand-purple-light px-2 py-0.5 text-xs text-brand-purple-dark"
                    >
                      {tag}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="text-xs text-brand-grey">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-sm text-brand-grey">
                {blog.readTime ?? "—"}
              </TableCell>

              <TableCell className="text-sm text-brand-grey">
                {blog.views}
              </TableCell>

              <TableCell className="text-sm text-brand-grey">
                {formatDate(blog.publishedAt)}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/blog/${blog._id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-purple transition-colors hover:bg-brand-purple-light"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(blog._id, blog.title)}
                    disabled={deletingId === blog._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === blog._id ? (
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
  );
}