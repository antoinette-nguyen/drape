"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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

type Outfit = {
  item_ids: string[];
  explanation: string;
};

type Props = {
  wardrobeItems: WardrobeItem[];
};

export default function OutfitGenerator({ wardrobeItems }: Props) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [shoppingRecs, setShoppingRecs] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateOutfits() {
    if (wardrobeItems.length < 2) {
      toast.error("Add at least 2 items to your wardrobe first");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/generate-outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wardrobeItems }),
    });

    if (!res.ok) {
      toast.error("Failed to generate outfits");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setOutfits(data.outfits || []);
    setShoppingRecs(data.shopping_recommendations || "");
    setLoading(false);
  }

  const getItemById = (id: string) => wardrobeItems.find(item => item.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Outfit suggestions</h2>
          <p className="text-sm text-neutral-500">AI-generated combinations from your wardrobe</p>
        </div>
        <Button onClick={generateOutfits} disabled={loading}>
          {loading ? "Styling..." : outfits.length > 0 ? "Regenerate" : "Generate outfits"}
        </Button>
      </div>

      {outfits.length === 0 && !loading && (
        <div className="text-center py-20 text-neutral-400">
          <p>Hit &quot;Generate outfits&quot; to see what you can wear</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {outfits.map((outfit, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-3">Look {i + 1}</p>
            <div className="flex gap-3 flex-wrap mb-4">
              {outfit.item_ids.map(id => {
                const item = getItemById(id);
                if (!item) return null;
                return (
                  <div key={id} className="flex flex-col items-center gap-1">
                    <div className="w-20 h-20 rounded-lg overflow-hidden relative border border-neutral-100">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <p className="text-xs text-neutral-600 text-center max-w-[80px] truncate">{item.name}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">{outfit.explanation}</p>
          </div>
        ))}
      </div>

      {shoppingRecs && (
        <div className="mt-6 bg-neutral-100 rounded-xl p-4">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-2">What to shop next</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{shoppingRecs}</p>
        </div>
      )}
    </div>
  );
}
