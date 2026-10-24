import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");

  return (
    <AdminPanel
      user={{
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      }}
    />
  );
}
