"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BlogsTable } from "@/components/blog/BlogsTable";
import { getAllBlogs, deleteBlog } from "@/lib/api/blog";
import type { BlogPost } from "@/lib/types/blog";

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPosts() {
    setIsLoading(true);
    try {
      const result = await getAllBlogs({ limit: 50 });
      setPosts(result.blogs);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteBlog(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Blog Posts
          </h1>
          <p className="mt-1 text-sm text-brand-grey">
            {posts.length} post{posts.length !== 1 && "s"}
          </p>
        </div>
        <Link
          href="/blog/new"
          className="flex items-center gap-2 rounded-xl bg-brand-purple-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-purple"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm">
        <BlogsTable
          blogs={posts}
          isLoading={isLoading}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}