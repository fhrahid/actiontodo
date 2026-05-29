"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { KatanaIcon } from "@/components/IconMap";

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.id) {
      router.replace(`/profile/${session.user.id}`);
    } else {
      router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-float"><KatanaIcon size={48} className="text-cyan-400" /></div>
        <p className="mt-4 text-gray-500">Loading your warrior profile...</p>
      </div>
    </div>
  );
}
