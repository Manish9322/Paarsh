"use client"

import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/slices/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const Navbar = () => {

  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = () => {
    dispatch(adminLogout()); // Redux  logout
    router.push("/");
  };
  const pathname = usePathname(); // ✅ Get current path dynamically
  if (pathname === "/admin/signin") return null; // ✅ Hide on sign-in page
  return (
    <nav className="fixed top-0 z-10 flex w-full items-center justify-between bg-white p-4 shadow-md">
      <h1 className="ml-20 text-3xl font-semibold text-black">PaarshEdu</h1>
      <Button
        onClick={handleLogout}
        className="mr-8 bg-blue-600 text-white hover:bg-blue-700"
      >
        Logout
      </Button>
    </nav>
  );
};

export default Navbar;
