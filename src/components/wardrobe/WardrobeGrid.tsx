"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

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
  items: WardrobeItem[];
  onDeleted: () => void;
};

export default function WardrobeGrid({ items, onDeleted }: Props) {
  async function handleDelete(item: WardrobeItem) {
    const supabase = createClient();
    const { error } = await supabase.from("wardrobe_items").delete().eq("id", item.id);
    if (error) {
      toast.error("Failed to remove item");
    } else {
      toast.success(`Removed ${item.name}`);
      onDeleted();
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400">
        <p className="text-lg">Your wardrobe is empty</p>
        <p className="text-sm mt-1">Add your first item to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
          <div className="aspect-square relative">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <button
              onClick={() => handleDelete(item)}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-neutral-600 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:bg-white"
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
          <div className="p-3">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">{item.category}</Badge>
              <Badge variant="outline" className="text-xs">{item.color}</Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
