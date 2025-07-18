"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  addTag,
  removeTag,
  setFile,
  resetForm,
  updateAuthorField,
} from "../../../lib/slices/blogSlice";
import {
  useFetchBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "@/services/api";
import { toast } from "sonner";
import { Blog } from "@/types/blog";
import { RxCross2 } from "react-icons/rx";
import { Editor } from "@tinymce/tinymce-react";
import DOMPurify from "dompurify";

export default function AdminBlogs() {
  // State for modal and tags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [blogToEdit, setBlogToEdit] = useState<Blog | null>(null);
  const [blogToView, setBlogToView] = useState<Blog | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const dispatch = useDispatch();
  const [createBlog, { isLoading }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const blogState = useSelector((state: any) => state.blog);
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Avoid using Redux for tags
  useEffect(() => {
    if (!isModalOpen) {
      setBlogTags([]);
    }
  }, [isModalOpen]);

  const {
    data: blogsData,
    isLoading: blogsLoading,
    error: blogsError,
  } = useFetchBlogsQuery(undefined);
  const blogs = blogsData?.blogs || [];

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        dispatch(
          setFile({
            field,
            fileData: reader.result,
          }),
        );
      };
      reader.onerror = (error) => {
        console.error(`Error converting ${field} to Base64:`, error);
      };
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  // Simplified tag handlers
  const addTagToForm = (tag: string) => {
    if (tag.trim() && !blogTags.includes(tag.trim())) {
      setBlogTags((prev) => [...prev, tag.trim()]);
    }
  };

  const removeTagFromForm = (tagToRemove: string) => {
    setBlogTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (tagInput.trim()) {
        addTagToForm(tagInput);
        setTagInput("");
      }
    }
  };

  // Modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset tags and input when opening modal
    setBlogTags([]);
    setTagInput("");
    dispatch(resetForm());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBlogTags([]);
    setTagInput("");
    setBlogToEdit(null);
    dispatch(resetForm());
  };

  const handleEditClick = (blog: Blog) => {
    setBlogToEdit(blog);
    setBlogTags(blog.tags || []);
    // Update Redux state with blog data
    dispatch(updateField({ field: "title", value: blog.title }));
    dispatch(updateField({ field: "content", value: blog.paragraph }));
    dispatch(updateField({ field: "image", value: blog.image }));
    dispatch(updateAuthorField({ field: "name", value: blog.author.name }));
    dispatch(
      updateAuthorField({
        field: "designation",
        value: blog.author.designation,
      }),
    );
    dispatch(updateAuthorField({ field: "image", value: blog.author.image }));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate required fields without tags
    if (
      !blogState.title ||
      !blogState.content ||
      !blogState.image ||
      !blogState.author.name ||
      !blogState.author.designation ||
      !blogState.author.image
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if we have tags
    if (!blogTags.length) {
      toast.error("Please add at least one tag");
      return;
    }

    try {
      const blogData = {
        title: blogState.title,
        paragraph: blogState.content,
        image: blogState.image,
        author: {
          name: blogState.author.name,
          designation: blogState.author.designation,
          image: blogState.author.image,
          authorimage: blogState.author.image,
        },
        tags: blogTags,
        publishDate: new Date().toISOString(),
      };

      if (blogToEdit) {
        // Update existing blog
        const response = await updateBlog({
          id: blogToEdit._id.toString(),
          blog: blogData,
        }).unwrap();
        if (response.success) {
          toast.success("Blog updated successfully!");
          handleCloseModal();
          dispatch(resetForm());
          setBlogTags([]);
          setBlogToEdit(null);
        } else {
          toast.error(response.message || "Failed to update blog");
        }
      } else {
        // Create new blog
        const response = await createBlog(blogData).unwrap();
        if (response.success) {
          toast.success("Blog created successfully!");
          handleCloseModal();
          dispatch(resetForm());
          setBlogTags([]);
        } else {
          toast.error(response.message || "Failed to create blog");
        }
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      const errorMessage =
        error.data?.message || error.message || "Failed to save blog";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (blogToDelete) {
      try {
        setDeletingId(Number(blogToDelete));
        const response = await deleteBlog(blogToDelete).unwrap();
        if (response.success) {
          toast.success("Blog deleted successfully!");
        } else {
          toast.error(response.message || "Failed to delete blog");
        }
      } catch (error) {
        console.error("Failed to delete:", error);
        toast.error(error.data?.message || "Failed to delete blog");
      } finally {
        setDeletingId(null);
        setIsDeleteModalOpen(false);
        setBlogToDelete(null);
      }
    }
  };

  const handleViewClick = (blog: Blog) => {
    setBlogToView(blog);
    setViewOpen(true);
  };

  if (isLoading) return <p>Loading blogs...</p>;

  // Search functionality
  const filteredBlogs = blogs.filter((blog) => {
    const searchTermLower = searchTerm.toLowerCase();

    // Search in main blog fields
    const titleMatch = blog.title.toLowerCase().includes(searchTermLower);
    const contentMatch = blog.paragraph.toLowerCase().includes(searchTermLower);

    // Search in author fields
    const authorNameMatch = blog.author.name
      .toLowerCase()
      .includes(searchTermLower);
    const authorDesignationMatch = blog.author.designation
      .toLowerCase()
      .includes(searchTermLower);

    // Search in tags
    const tagsMatch = blog.tags.some((tag) =>
      tag.toLowerCase().includes(searchTermLower),
    );

    // Search in date
    const dateMatch = new Date(blog.publishDate)
      .toLocaleDateString()
      .toLowerCase()
      .includes(searchTermLower);

    return (
      titleMatch ||
      contentMatch ||
      authorNameMatch ||
      authorDesignationMatch ||
      tagsMatch ||
      dateMatch
    );
  });

  // Update pagination to use filtered blogs
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage,
  );
  const startIndex = (currentPage - 1) * blogsPerPage;
  const maxPagesToShow = 5;

  const generatePaginationNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }

      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always include last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Blog Management</h1>
        <Button size="sm" onClick={handleOpenModal}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-lg md:sticky md:top-0 md:h-screen">
          <div className="h-16 md:h-0"></div>
          <Sidebar userRole="admin" />
        </aside>

        {/* Main Content */}
        <main className="w-full flex-1 overflow-x-hidden pt-16">
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    Blog Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-white md:w-64"
                    />
                    <Button
                      className="h-10 w-full rounded bg-white text-blue-600 transition-colors md:w-auto hover:bg-blue-50"
                      onClick={handleOpenModal}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Blog
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Published Date</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedBlogs.map((blog: Blog, index: number) => (
                      <TableRow key={blog._id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * blogsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{blog.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative h-8 w-8 rounded-full">
                              <Image
                                src={blog.author.image || "/images/favicon.png"}
                                alt={blog.author.name}
                                fill
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to a known existing image
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/favicon.png";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">
                                {blog.author.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {blog.author.designation}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(blog.publishDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewClick(blog)}
                            >
                              <Eye
                                size={16}
                                className="transition-transform group-hover:scale-110"
                              />
                              <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                View details
                              </span>
                            </Button>
                            <Button
                              className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(blog)}
                            >
                              <Edit
                                size={16}
                                className="transition-transform group-hover:scale-110"
                              />
                              <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                Edit blog
                              </span>
                            </Button>
                            <Button
                              className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(blog._id.toString())
                              }
                              disabled={isDeleting && deletingId?.toString() === blog._id}
                            >
                              <Trash2
                                size={16}
                                className="transition-transform group-hover:scale-110"
                              />
                              <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                Delete blog
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
                  <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {startIndex + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {Math.min(startIndex + blogsPerPage, blogs.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {blogs.length}
                      </span>{" "}
                      blogs
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page Numbers */}
                      <div className="hidden sm:flex sm:items-center sm:space-x-1">
                        {generatePaginationNumbers().map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-1 text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={`page-${page}`}
                              onClick={() => setCurrentPage(Number(page))}
                              className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                                currentPage === page
                                  ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                              }`}
                              aria-label={`Page ${page}`}
                              aria-current={
                                currentPage === page ? "page" : undefined
                              }
                            >
                              {page}
                            </Button>
                          ),
                        )}
                      </div>

                      {/* Mobile Page Indicator */}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                        Page {currentPage} of {totalPages || 1}
                      </span>

                      <Button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages || 1),
                          )
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Jump to page (desktop only) */}
                    <div className="hidden items-center space-x-2 lg:flex">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Go to page:
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={totalPages || 1}
                        value={currentPage}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 1 && value <= totalPages) {
                            setCurrentPage(value);
                          }
                        }}
                        className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                        aria-label="Go to page"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Blog Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {blogToEdit ? "Edit Blog" : "Create New Blog"}
            </DialogTitle>
          </DialogHeader>

          <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <div className="space-y-1">
                <Input
                  id="title"
                  placeholder="Enter blog title (max 9 words)"
                  required
                  value={blogState.title}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    const wordCount =
                      e.target.value.trim() === "" ? 0 : words.length;

                    if (wordCount <= 9) {
                      dispatch(
                        updateField({ field: "title", value: e.target.value }),
                      );
                    } else {
                      toast.warning("Maximum 9 words allowed in title!", {
                        description: `Current word count: ${wordCount}. Please shorten your title.`,
                      });
                    }
                  }}
                  className={`${blogState.title.trim().split(/\s+/).length === 9 ? "border-orange-500" : ""}`}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {blogState.title.trim() === ""
                      ? "0"
                      : blogState.title.trim().split(/\s+/).length}
                    /9 words
                  </span>
                  {blogState.title.trim().split(/\s+/).length === 9 && (
                    <span className="text-orange-500">Word limit reached</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={blogState.content}
                onEditorChange={(content) =>
                  dispatch(updateField({ field: "content", value: content }))
                }
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "paste",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  setup: (editor) => {
                    editor.on("init", () => {
                      if (blogToEdit && blogState.content) {
                        editor.setContent(blogState.content);
                      }
                    });
                  },
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Featured Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "blogImage")}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Author Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="author-name">Name</Label>
                  <Input
                    id="author-name"
                    placeholder="Author name"
                    required
                    value={blogState.author.name}
                    onChange={(e) =>
                      dispatch(
                        updateAuthorField({
                          field: "name",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="author-designation">Designation</Label>
                  <Input
                    id="author-designation"
                    placeholder="Author designation"
                    required
                    value={blogState.author.designation}
                    onChange={(e) =>
                      dispatch(
                        updateAuthorField({
                          field: "designation",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="author-image">Author Image</Label>
                <Input
                  id="author-image"
                  name="author-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "authorImage")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="mb-2 flex flex-wrap gap-2">
                {blogTags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTagFromForm(tag)}
                      className="ml-1 rounded-full hover:bg-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (tagInput.trim()) {
                      addTagToForm(tagInput);
                      setTagInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isPublished" />
              <Label htmlFor="isPublished">Publish blog</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isLoading || isUpdating}
                onClick={handleSubmit}
              >
                {isLoading || isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {blogToEdit ? "Updating..." : "Creating..."}
                  </>
                ) : blogToEdit ? (
                  "Update Blog"
                ) : (
                  "Create Blog"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete Blog
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setBlogToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Blog Details Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Blog Details
              </DialogTitle>
              <RxCross2
                size={20}
                className="cursor-pointer"
                onClick={() => setViewOpen(false)}
              />
            </div>
          </DialogHeader>

          {blogToView ? (
            <div className="p-6">
              {/* Featured Image */}
              <div className="mb-6">
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <Image
                    src={blogToView.image || "/images/favicon.png"}
                    alt={blogToView.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/favicon.png";
                    }}
                  />
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-6">
                {/* Title and Author */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {blogToView.title}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 rounded-full">
                      <Image
                        src={blogToView.author.image || "/images/favicon.png"}
                        alt={blogToView.author.name}
                        fill
                        className="rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/favicon.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {blogToView.author.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {blogToView.author.designation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                  <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      Blog Content
                    </h3>
                  </div>
                  <div
                    className="p-4 text-base font-medium leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(blogToView.paragraph),
                    }}
                  />
                </div>

                {/* Tags */}
                <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                  <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      Tags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4">
                    {blogToView.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publication Date */}
                <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                  <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      Publication Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Published Date
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {new Date(blogToView.publishDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No blog selected.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}