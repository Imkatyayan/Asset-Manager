import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  // Enforce admin protection on server side
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-market-bg text-market-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-market-text">
            Admin Operations Console
          </h1>
          <p className="mt-2 text-sm text-market-muted">
            Manage registered accounts, inspect platform metrics, and control server data caches.
          </p>
        </header>

        <AdminDashboardView currentAdminId={session.id} />
      </div>
    </div>
  );
}
