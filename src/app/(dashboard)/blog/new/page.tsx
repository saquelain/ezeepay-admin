import BlogForm from "@/components/blog/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-purple-dark">
        New Blog Post
      </h1>
      <BlogForm mode="create" />
    </div>
  );
}