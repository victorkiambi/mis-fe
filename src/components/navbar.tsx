"use client";

import { usePathname } from "next/navigation";
import { UserCircle, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { useAuth } from "@/providers/auth-provider";

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      active: paths.length === 1,
    },
  ];

  if (paths.length > 1) {
    const section = paths[1];
    items.push({
      label: section.charAt(0).toUpperCase() + section.slice(1),
      href: `/${paths.slice(0, 2).join('/')}`,
      active: true,
    });
  }

  return items;
}

export function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex flex-1">
          <Breadcrumb items={breadcrumbs} />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <UserCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 