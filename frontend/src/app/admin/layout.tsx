"use client";
import Sidebar from "@/components/Sidebar";
import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["admin"]}>
      <div className="flex min-h-screen">
        <Sidebar role="admin" />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </RoleGuard>
  );
}
