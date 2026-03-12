import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route protection is already handled by proxy.ts, but this is a double-check
  if (!session?.user) {
    redirect("/login");
  }

  // Fallback to STUDENT if role is somehow missing
  const role = (session.user.role as "TEACHER" | "CLASS_LEADER" | "STUDENT") || "STUDENT";

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      {/* Sidebar - Client Component */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header - Client Component */}
        <Header user={session.user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 relative z-0">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
