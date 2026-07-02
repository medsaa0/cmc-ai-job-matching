"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getToken } from "@/lib/auth";
import type { User } from "@/types";

export default function RoleGuard({
  roles,
  children,
}: {
  roles: User["role"][];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (!roles.includes(user.role)) {
      router.push("/login");
      return;
    }
    setReady(true);
  }, [router, roles]);

  if (!ready) return null;
  return <>{children}</>;
}
