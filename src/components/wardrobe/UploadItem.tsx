"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  userId: string;
  onUploaded: () => void;
};

export default function UploadItem({ userId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    // 1. Upload image to Supabase storage
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("wardrobe")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    // 2. Get the public URL
    const { data: urlData } = supabase.storage.from("wardrobe").getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    // 3. Ask Claude to analyze the item
    const analysisRes = await fetch("/api/analyze-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    if (!analysisRes.ok) {
      toast.error("Failed to analyze item");
      setUploading(false);
      return;
    }

    const analysis = await analysisRes.json();

    // 4. Save to database
    const { error: dbError } = await supabase.from("wardrobe_items").insert({
      user_id: userId,
      image_url: imageUrl,
      name: analysis.name,
      category: analysis.category,
      color: analysis.color,
      style: analysis.style,
      description: analysis.description,
    });

    if (dbError) {
      toast.error("Failed to save item");
    } else {
      toast.success(`Added ${analysis.name} to your wardrobe`);
      onUploaded();
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="upload-input"
        onChange={handleFile}
        disabled={uploading}
      />
      <label htmlFor="upload-input">
        <Button disabled={uploading} className="cursor-pointer" onClick={() => inputRef.current?.click()}>
          {uploading ? "Analyzing..." : "+ Add item"}
        </Button>
      </label>
    </div>
  );
}
