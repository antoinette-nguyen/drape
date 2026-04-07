"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-neutral-500 max-w-sm">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-neutral-500 text-sm mb-6">Start building your AI wardrobe</p>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
        </form>
        <p className="text-sm text-neutral-500 mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-neutral-900 underline underline-offset-2">Log in</Link>
        </p>
      </div>
    </main>
  );
}
