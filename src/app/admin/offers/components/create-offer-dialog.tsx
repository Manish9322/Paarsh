"use client";

import { useState } from "react";
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
import { useAddOfferMutation, useUpdateOfferMutation, useFetchCourcesQuery } from "@/services/api";

const formSchema = z.object({
  code: z.string().min(3, "Offer code must be at least 3 characters"),
  discountPercentage: z.coerce
    .number()
    .min(1, "Minimum discount is 1%")
    .max(100, "Maximum discount is 100%"),
  validFrom: z.string(),
  validUntil: z.string(),
  appliedCourses: z.array(z.string()).min(1, "Select at least one course"),
});

type FormValues = z.infer<typeof formSchema>;

interface Course {
  id: string;
  title: string;
  courseName: string;
}

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer?: any;
  onSuccess: () => void;
}

export default function CreateOfferDialog({
  open,
  onOpenChange,
  offer,
  onSuccess,
}: CreateOfferDialogProps) {
  const { data: coursesData } = useFetchCourcesQuery({});
  const [addOffer] = useAddOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();

  const courses = coursesData?.data || [];

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: offer?.code || "",
      discountPercentage: offer?.discountPercentage || 0,
      validFrom: formatDateForInput(offer?.validFrom) || formatDateForInput(new Date()),
      validUntil: formatDateForInput(offer?.validUntil) || formatDateForInput(new Date()),
      appliedCourses: offer?.courses?.map((c: any) => c.id) || [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const submitData = {
        ...values,
        validFrom: new Date(values.validFrom).toISOString(),
        validUntil: new Date(values.validUntil).toISOString(),
      };

      if (offer) {
        await updateOffer({ id: offer._id, ...submitData }).unwrap();
      } else {
        await addOffer(submitData).unwrap();
      }
      toast.success(`Offer ${offer ? "updated" : "created"} successfully`);
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${offer ? "update" : "create"} offer`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
            {offer ? "Edit Offer" : "Create New Offer"}
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
                    <FormLabel className="text-gray-700 dark:text-gray-300">Offer Code</FormLabel>
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
                    <FormLabel className="text-gray-700 dark:text-gray-300">Discount Percentage</FormLabel>
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Valid From</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toISOString().split('T')[0]}
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Valid Until</FormLabel>
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
                name="appliedCourses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Applied Courses</FormLabel>
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
                      <SelectContent className="dark:bg-gray-800">
                        {courses.map((course) => (
                          <SelectItem 
                            key={course._id} 
                            value={course._id}
                            className="dark:text-white dark:focus:bg-gray-700"
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
                            <span className="text-sm text-blue-700 dark:text-blue-300">{course.courseName}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((id) => id !== courseId)
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
                  {offer ? "Update Offer" : "Create Offer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 