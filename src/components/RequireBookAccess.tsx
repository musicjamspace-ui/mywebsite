"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/api";

interface Props {
  children: React.ReactNode;
}

export default function RequireBookAccess({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getStoredToken()) {
      setReady(true);
    } else {
      router.replace("/admin");
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
