"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import UploadItem from "@/components/wardrobe/UploadItem";
import WardrobeGrid from "@/components/wardrobe/WardrobeGrid";
import OutfitGenerator from "@/components/outfits/OutfitGenerator";
import { Button } from "@/components/ui/button";

type WardrobeItem = {
  id: string;
  image_url: string;
  name: string;
  category: string;
  color: string;
  style: string;
  description: string;
};

type Props = {
  user: User;
  initialItems: WardrobeItem[];
};

type Tab = "wardrobe" | "outfits";

export default function DashboardClient({ user, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<Tab>("wardrobe");

  async function refreshItems() {
    const supabase = createClient();
    const { data } = await supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Drape</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white px-6">
        <div className="flex gap-6">
          {(["wardrobe", "outfits"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab}
              {tab === "wardrobe" && items.length > 0 && (
                <span className="ml-2 text-xs text-neutral-400">({items.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-6 max-w-5xl mx-auto w-full">
        {activeTab === "wardrobe" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Your wardrobe</h2>
                <p className="text-sm text-neutral-500">Upload photos of your clothing items</p>
              </div>
              <UploadItem userId={user.id} onUploaded={refreshItems} />
            </div>
            <WardrobeGrid items={items} onDeleted={refreshItems} />
          </div>
        )}

        {activeTab === "outfits" && (
          <OutfitGenerator wardrobeItems={items} />
        )}
      </main>
    </div>
  );
}
