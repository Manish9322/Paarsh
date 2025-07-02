"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAddOfferMutation,
  useUpdateOfferMutation,
  useFetchCourcesQuery,
  useFetchUsersQuery,
} from "@/services/api";
import { useSelector } from "react-redux";
import { selectRootState } from "../../../../lib/store";

const formSchema = z.object({
  code: z.string().min(3, "Offer code must be at least 3 characters"),
  discountPercentage: z.coerce
    .number()
    .min(1, "Minimum discount is 1%")
    .max(100, "Maximum discount is 100%"),
  validFrom: z.string(),
  validUntil: z.string(),
  applicableTo: z.enum(["courses", "users", "both"], {
    required_error: "Please select an applicable target",
  }),
  appliedCourses: z.array(z.string()).optional(),
  appliedUsers: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.applicableTo === "courses") {
      return data.appliedCourses && data.appliedCourses.length > 0;
    }
    if (data.applicableTo === "users") {
      return data.appliedUsers && data.appliedUsers.length > 0;
    }
    if (data.applicableTo === "both") {
      return (
        (data.appliedCourses && data.appliedCourses.length > 0) ||
        (data.appliedUsers && data.appliedUsers.length > 0)
      );
    }
    return true;
  },
  {
    message: "Select at least one course or user based on applicable target",
    path: ["appliedCourses", "appliedUsers"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface Course {
  id: string;
  _id: string;
  title: string;
  courseName: string;
}

interface User {
  id: string;
  _id: string;
  email: string;
}

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateOfferDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOfferDialogProps) {
  const { data: coursesData } = useFetchCourcesQuery({});
  const { data: usersData } = useFetchUsersQuery({});
  const [addOffer] = useAddOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const offer = useSelector((state) => selectRootState(state).offers);

  const courses = coursesData?.data || [];
  const users = usersData?.data || [];

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      discountPercentage: 0,
      validFrom: formatDateForInput(new Date()),
      validUntil: formatDateForInput(new Date()),
      applicableTo: "courses",
      appliedCourses: [],
      appliedUsers: [],
    },
  });

  // Reset form when selectedOffer changes
  useEffect(() => {
    if (open) {
      if (offer.selectedOffer) {
        const selectedOffer = offer.selectedOffer;
        form.reset({
          code: selectedOffer.code || "",
          discountPercentage: selectedOffer.discountPercentage || 0,
          validFrom: formatDateForInput(selectedOffer.validFrom) || formatDateForInput(new Date()),
          validUntil: formatDateForInput(selectedOffer.validUntil) || formatDateForInput(new Date()),
          applicableTo: selectedOffer.applicableTo || "courses",
          appliedCourses: selectedOffer.courses?.map((c) => c._id || c.id) || [],
          appliedUsers: selectedOffer.users?.map((u) => u._id || u.id) || [],
        });
      } else {
        form.reset({
          code: "",
          discountPercentage: 0,
          validFrom: formatDateForInput(new Date()),
          validUntil: formatDateForInput(new Date()),
          applicableTo: "courses",
          appliedCourses: [],
          appliedUsers: [],
        });
      }
    }
  }, [offer.selectedOffer, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const submitData = {
        code: values.code,
        discountPercentage: values.discountPercentage,
        validFrom: new Date(values.validFrom).toISOString(),
        validUntil: new Date(values.validUntil).toISOString(),
        applicableTo: values.applicableTo,
        courses: values.appliedCourses || [],
        users: values.appliedUsers || [],
      };

      if (offer.selectedOffer) {
        await updateOffer({
          id: offer.selectedOffer._id,
          ...submitData,
        }).unwrap();
        toast.success("Offer updated successfully");
      } else {
        await addOffer(submitData).unwrap();
        toast.success("Offer created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${offer.selectedOffer ? "update" : "create"} offer`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className="max-h-[90vh] max-w-md overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center justify-between">
            <span>{offer.selectedOffer ? "Edit Offer" : "Create New Offer"}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onOpenChange(false)}
            >
              <span className="text-lg font-semibold">×</span>
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Offer Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SUMMER2024"
                        {...field}
                        className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Discount Percentage
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="20"
                        {...field}
                        className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Valid From
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toISOString().split("T")[0]}
                          className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Valid Until
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={form.getValues("validFrom")}
                          className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="applicableTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Applicable To
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800 dark:text-white">
                        <SelectItem value="courses">Courses</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appliedCourses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Applied Courses
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select courses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800 dark:text-white">
                        {courses.map((course) => (
                          <SelectItem
                            key={course._id}
                            value={course._id}
                            className="bg-gray-100 text-black dark:text-white dark:bg-gray-700 dark:focus:bg-gray-600"
                          >
                            {course.courseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((courseId) => {
                        const course = courses.find((c) => c._id === courseId);
                        if (!course) return null;
                        return (
                          <div
                            key={courseId}
                            className="flex items-center gap-1 bg-blue-50 dark:bg-gray-700 px-2 py-1 rounded-md"
                          >
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                              {course.courseName}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
                              onClick={() => {
                                field.onChange(
                                  (field.value ?? []).filter((id) => id !== courseId)
                                );
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appliedUsers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Applied Users
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select users" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800 dark:text-white">
                        {users.map((user) => (
                          <SelectItem
                            key={user._id}
                            value={user._id}
                            className="bg-gray-100 text-black dark:text-white dark:bg-gray-700 dark:focus:bg-gray-600"
                          >
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((userId) => {
                        const user = users.find((u) => u._id === userId);
                        if (!user) return null;
                        return (
                          <div
                            key={userId}
                            className="flex items-center gap-1 bg-blue-50 dark:bg-gray-700 px-2 py-1 rounded-md"
                          >
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                              {user.email}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
                              onClick={() => {
                                field.onChange(
                                  (field.value ?? []).filter((id) => id !== userId)
                                );
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {offer.selectedOffer ? "Update Offer" : "Create Offer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}