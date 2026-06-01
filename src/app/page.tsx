"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Crescia</h1>
          <p className="text-muted-foreground text-lg">
            Your AI-powered exam prep platform
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/sign-in">Sign In</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/sign-up">Sign Up</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
