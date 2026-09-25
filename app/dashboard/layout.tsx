import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/backend/auth/session";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  return <DashboardShell usuario={usuario}>{children}</DashboardShell>;
}
