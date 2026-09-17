import { verifySession } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
