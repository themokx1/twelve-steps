import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getOptionalUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getOptionalUser();

  if (session) {
    redirect("/");
  }

  return <AuthCard />;
}
