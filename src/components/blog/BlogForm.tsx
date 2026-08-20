"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Loader2, X } from "lucide-react";
import { TipTapEditor } from "./TipTapEditor";
import { getAllCategories } from "@/lib/api/category";
import { uploadImage } from "@/lib/api/upload";
import { createBlog, updateBlog } from "@/lib/api/blog";
import { slugify } from "@/lib/utils/slugify";
import type { BlogPost, Category } from "@/lib/types/blog";

type BlogFormProps = {
  mode: "create" | "edit";
  initialData?: BlogPost;
};

function SectionCard({
    title: sectionTitle,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="space-y-4 rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-grey">
          {sectionTitle}
        </h2>
        {children}
      </div>
    );
  }
  
export default function BlogForm({ mode, initialData }: BlogFormProps) {
    const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [categoryId, setCategoryId] = useState(
    typeof initialData?.category === "object"
      ? initialData.category._id
      : initialData?.category || ""
  );
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || ""
  );
  const [readTime, setReadTime] = useState(initialData?.readTime || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    initialData?.metaDescription || ""
  );

  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished || false
  );

  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Auto-generate slug from title until the user manually edits the slug field
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
  };

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
    } catch {
      setError("Cover image upload failed. Please try again.");
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  }

  const buildPayload = useCallback(
    (publishNow: boolean) => ({
      title,
      slug,
      excerpt,
      category: categoryId,
      coverImage: coverImage || null,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      readTime: readTime || null,
      content,
      metaTitle,
      metaDescription,
      isPublished: publishNow,
    }),
    [
        title, slug, excerpt, categoryId, coverImage, tagsInput,
        readTime, content, metaTitle, metaDescription,
      ]
  );

  async function handleSave(publishNow: boolean) {
    setError(null);

    if (!title || !slug || !excerpt || !categoryId) {
      setError("Title, slug, excerpt, and category are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        const created = await createBlog(buildPayload(publishNow));
        router.push(`/blog/${created._id}/edit`);
      } else if (initialData) {
        await updateBlog(initialData._id, buildPayload(publishNow));
        router.push("/blog");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Basic Info */}
      <SectionCard title="Basic Info">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="AePS Complete Guide for Retailers"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              placeholder="aeps-complete-guide-for-retailers"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-2 py-3 text-center text-sm text-brand-grey">
                    No categories yet
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Excerpt *</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description shown on the blog listing page"
              rows={2}
              maxLength={500}
            />
            <p className="text-right text-xs text-brand-grey">
              {excerpt.length}/500
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Tags (comma separated)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="aeps, banking, retailers"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Read Time</Label>
            <Input
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="8 min read"
            />
          </div>
        </div>
      </SectionCard>

      {/* Cover Image */}
      <SectionCard title="Cover Image">
        {coverImage ? (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl bg-brand-purple-light">
            <Image src={coverImage} alt="Cover" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setCoverImage("")}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="mr-1.5 h-4 w-4" />
              )}
              {isUploadingCover ? "Uploading..." : "Upload Cover"}
            </Button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        )}
      </SectionCard>

      {/* Content */}
      <SectionCard title="Content">
        <TipTapEditor
          value={content}
          onChange={setContent}
          onImageUpload={uploadImage}
          placeholder="Start writing your blog post..."
        />
      </SectionCard>

      {/* SEO */}
      <SectionCard title="SEO">
        <div className="space-y-1.5">
          <Label>Meta Title</Label>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Leave empty to use blog title"
          />
          <p className="text-xs text-brand-grey">
            Recommended: 50–60 characters.{" "}
            <span className={metaTitle.length > 60 ? "text-red-500" : ""}>
              {metaTitle.length}/60
            </span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description</Label>
          <Textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Leave empty to use excerpt"
            rows={3}
          />
          <p className="text-xs text-brand-grey">
            Recommended: 150–160 characters.{" "}
            <span
              className={metaDescription.length > 160 ? "text-red-500" : ""}
            >
              {metaDescription.length}/160
            </span>
          </p>
        </div>
      </SectionCard>

      {/* Publish + Actions */}
      <div className="flex items-center justify-between rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 accent-brand-purple-dark"
          />
          <span className="text-sm font-medium text-brand-purple-dark">
            Publish immediately
          </span>
        </label>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/blog")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(isPublished)}
            disabled={isSaving}
            className="bg-brand-purple-dark hover:bg-brand-purple"
          >
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Update Blog" : "Create Blog"}
          </Button>
        </div>
      </div>
    </div>
  );
}