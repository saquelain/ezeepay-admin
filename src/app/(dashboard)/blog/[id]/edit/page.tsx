"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import BlogForm from "@/components/blog/BlogForm";
import { getBlogById } from "@/lib/api/blog";
import type { BlogPost } from "@/lib/types/blog";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBlogById(id)
      .then(setPost)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-brand-grey">Blog post not found.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-purple-dark">
        Edit Blog Post
      </h1>
      <BlogForm mode="edit" initialData={post} />
    </div>
  );
}