import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <h1 className="text-5xl font-semibold tracking-tight mb-4">Drape</h1>
      <p className="text-lg text-neutral-500 max-w-md mb-8">
        Upload your wardrobe. Let AI build outfits you&apos;ve never thought to wear.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button variant="outline">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button>Get started</Button>
        </Link>
      </div>
    </main>
  );
}
