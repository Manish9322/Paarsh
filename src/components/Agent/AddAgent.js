import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAddAgentMutation } from "../../services/api";
import { resetForm } from "../../lib/slices/agentSlice";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ✅ Define Validation Schema using Zod
const agentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z
    .string()
    .length(10, "Mobile number must be exactly 10 digits.")
    .regex(/^\d{10}$/, "Only numbers are allowed."),
  gender: z.enum(["Male", "Female", "Other"], { message: "Select a gender" }),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

const AddAgentModal = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const [addAgent, { isLoading }] = useAddAgentMutation();

  // ✅ Use react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      gender: "",
      city: "",
      state: "",
    },
  });

  // ✅ Reset form when the modal opens
  useEffect(() => {
    if (open) {
      reset();
      dispatch(resetForm()); // Reset Redux state if needed
    }
  }, [open, reset, dispatch]);

  // ✅ Handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await addAgent(data).unwrap();
      if (response?.success) {
        toast.success("Agent added successfully");
        setOpen(false);
        reset(); // Reset form fields
        dispatch(resetForm()); // Reset Redux state
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to add agent. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">Add Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <Input {...register("firstName")} placeholder="First Name" />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}

          {/* Last Name */}
          <Input {...register("lastName")} placeholder="Last Name" />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}

          {/* Email */}
          <Input
            {...register("email")}
            placeholder="Email Address"
            type="email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}

          {/* Mobile Number */}
          <Input
            {...register("mobile")}
            placeholder="Phone Number"
            type="tel"
            maxLength={10}
            inputMode="numeric" // Enables number keypad on mobile devices
            pattern="[0-9]*" // Ensures only numbers can be entered
            onKeyDown={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            className="input-style"
          />
          {errors.mobile && (
            <p className="text-sm text-red-500">{errors.mobile.message}</p>
          )}

          {/* Gender (Using React Hook Form Select) */}
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender.message}</p>
          )}

          {/* City */}
          <Input {...register("city")} placeholder="City" />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}

          {/* State */}
          <Input {...register("state")} placeholder="State" />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-500 p-2 text-white"
          >
            {isLoading ? "Adding..." : "Add Agent"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgentModal;
