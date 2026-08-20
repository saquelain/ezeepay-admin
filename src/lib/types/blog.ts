export type Category = {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    order: number;
    isActive: boolean;
  };
  
  export type BlogPost = {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: Category | string;
    coverImage: string | null;
    tags: string[];
    readTime: string | null;
    content: string;
    metaTitle: string;
    metaDescription: string;
    isPublished: boolean;
    publishedAt: string | null;
    views: number;
    author: {
      name: string;
      role: string;
      avatar: string | null;
    };
    createdBy: { _id: string; name: string; email: string };
    createdAt: string;
    updatedAt: string;
  };
  
  export type BlogListResponse = {
    success: boolean;
    data: {
      blogs: BlogPost[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  };