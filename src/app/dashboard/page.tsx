import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: wardrobeItems } = await supabase
    .from("wardrobe_items")
    .select("*")
    .order("created_at", { ascending: false });

  return <DashboardClient user={user} initialItems={wardrobeItems ?? []} />;
}
