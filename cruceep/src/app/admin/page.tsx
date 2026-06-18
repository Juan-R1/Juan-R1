import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminNotice } from "@/components/admin/admin-notice";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  // Without Supabase there is no auth/role system — explain instead of 500ing.
  if (!isSupabaseConfigured()) {
    return <AdminNotice variant="unconfigured" />;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    return <AdminNotice variant="forbidden" />;
  }

  return <AdminDashboard />;
}
