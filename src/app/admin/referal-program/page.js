"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil, Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useFetchReferralSettingsQuery, useUpdateReferralSettingsMutation } from "@/services/api";

const ReferralSettingsPage = () => {
  const [editSettingsOpen, setEditSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch referral settings
  const { data: settingsData, isLoading, error } = useFetchReferralSettingsQuery(undefined);
  const [updateReferralSettings] = useUpdateReferralSettingsMutation();

  const referralSettings = settingsData?.data || {
    discountPercentage: 20,
    cashbackAmount: 20,
    maxReferrals: 0,
    rewardCreditDays: 2,
  };

  // Form setup
  const form = useForm({
    defaultValues: {
      discountPercentage: referralSettings.discountPercentage.toString(),
      cashbackAmount: referralSettings.cashbackAmount.toString(),
      maxReferrals: referralSettings.maxReferrals.toString(),
      rewardCreditDays: referralSettings.rewardCreditDays.toString(),
    },
  });

  // Update form defaults when settings data changes
  React.useEffect(() => {
    if (settingsData?.data) {
      form.reset({
        discountPercentage: settingsData.data.discountPercentage.toString(),
        cashbackAmount: settingsData.data.cashbackAmount.toString(),
        maxReferrals: settingsData.data.maxReferrals.toString(),
        rewardCreditDays: settingsData.data.rewardCreditDays.toString(),
      });
    }
  }, [settingsData, form]);

  // Handle form submission
  const handleUpdateSettings = async (data) => {
    try {
      const settings = {
        discountPercentage: parseInt(data.discountPercentage),
        cashbackAmount: parseInt(data.cashbackAmount),
        maxReferrals: parseInt(data.maxReferrals),
        rewardCreditDays: parseInt(data.rewardCreditDays),
      };

      if (
        isNaN(settings.discountPercentage) ||
        isNaN(settings.cashbackAmount) ||
        isNaN(settings.maxReferrals) ||
        isNaN(settings.rewardCreditDays)
      ) {
        toast.error("Please fill in all fields with valid numbers");
        return;
      }

      if (settings.discountPercentage < 0 || settings.discountPercentage > 100) {
        toast.error("Discount percentage must be between 0 and 100");
        return;
      }

      if (settings.cashbackAmount < 0) {
        toast.error("Cashback amount cannot be negative");
        return;
      }

      if (settings.maxReferrals < 0) {
        toast.error("Maximum referrals cannot be negative");
        return;
      }

      if (settings.rewardCreditDays < 0) {
        toast.error("Reward credit days cannot be negative");
        return;
      }

      await updateReferralSettings(settings).unwrap();
      toast.success("Referral settings updated successfully");
      setEditSettingsOpen(false);
    } catch (error) {
      toast.error(`Failed to update referral settings: ${error.data?.error || "Unknown error"}`);
    }
  };

  // Edit Settings Modal Component
  const EditSettingsModal = ({ isOpen, onClose, onSubmit }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Edit Referral Settings
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Discount Percentage (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter discount percentage"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                        max="100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashbackAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cashback Amount (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter cashback amount"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxReferrals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Maximum Referrals (0 for unlimited)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter maximum referrals"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rewardCreditDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reward Credit Days
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter reward credit days"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Settings
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Referral Settings Management
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-300 dark:bg-gray-800 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar userRole="admin" />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="w-full flex-1 overflow-x-hidden pt-16">
        <div className="container mx-auto px-4 py-6">
          <Card className="border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r rounded-t from-blue-600 to-blue-800 p-4">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Referral Settings Management
                </CardTitle>
                <Button
                  onClick={() => setEditSettingsOpen(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Pencil className="mr-2 h-5 w-5" />
                  Edit Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : error ? (
                <p className="text-red-500">Error loading referral settings</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Discount Percentage
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {referralSettings.discountPercentage}%
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cashback Amount
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      ₹{referralSettings.cashbackAmount}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Maximum Referrals
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {referralSettings.maxReferrals === 0 ? "Unlimited" : referralSettings.maxReferrals}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reward Credit Days
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {referralSettings.rewardCreditDays} {referralSettings.rewardCreditDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Settings Modal */}
      <EditSettingsModal
        isOpen={editSettingsOpen}
        onClose={() => setEditSettingsOpen(false)}
        onSubmit={handleUpdateSettings}
      />
    </div>
  );
};

export default ReferralSettingsPage;