import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-10 flex w-full items-center justify-between bg-white p-4 shadow-md">
      <h1 className="ml-20 text-3xl font-semibold text-black">PaarshEdu</h1>
      <Button className="mr-8 bg-blue-600 text-white hover:bg-blue-700">
        Logout
      </Button>
    </nav>
  );
};

export default Navbar;
