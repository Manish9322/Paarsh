"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";

export default function SimpleHeader() {
  const [sticky, setSticky] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-40 transition ${sticky ? "bg-white shadow-md" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between py-4">
        <Link href="/">
          <Image src="/images/logo/logo.svg" alt="logo" width={120} height={30} />
        </Link>
        <nav className="flex space-x-6">
          {[{ title: "Home", path: "/" }, { title: "About", path: "/about" }, { title: "Contact", path: "/contact" }].map((item, index) => (
            <Link key={index} href={item.path} className={pathname === item.path ? "text-primary" : "text-gray-700 hover:text-primary"}>
              {item.title}
            </Link>
          ))}
        </nav>
        <ThemeToggler />
      </div>
    </header>
  );
}
