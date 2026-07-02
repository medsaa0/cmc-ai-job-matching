"use client";
import Sidebar from "@/components/Sidebar";
import RoleGuard from "@/components/RoleGuard";

export default function EntrepriseLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["entreprise"]}>
      <div className="flex min-h-screen">
        <Sidebar role="entreprise" />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </RoleGuard>
  );
}
