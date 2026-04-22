import { Suspense } from "react";
import Admin from "@/views/Admin";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#07070f" }}>
          <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <Admin />
    </Suspense>
  );
}
