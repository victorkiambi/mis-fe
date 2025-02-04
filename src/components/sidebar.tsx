"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  Users2Icon,
  FolderIcon,
  MapPinIcon,
} from "lucide-react";

const routes = [
  {
    label: "Overview",
    icon: HomeIcon,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Programs",
    icon: FolderIcon,
    href: "/dashboard/programs",
    color: "text-violet-500",
  },
  {
    label: "Households",
    icon: Users2Icon,
    href: "/dashboard/households",
    color: "text-pink-700",
  },
  {
    label: "Locations",
    icon: MapPinIcon,
    href: "/dashboard/locations",
    color: "text-orange-700",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full w-64 bg-[#111827] text-white">
      <div className="flex h-full flex-col">
        <div className="px-3 py-4">
          <Link href="/dashboard" className="flex items-center pl-3 mb-14">
            <h1 className="text-2xl font-bold">MIS Dashboard</h1>
          </Link>
        </div>
        <div className="flex-1 px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href
                    ? "text-white bg-white/10"
                    : "text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 