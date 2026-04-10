"use client";

import { signOutUser } from "@/src/services/authClientService";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error(e);
    }
    router.push("/auth/login");
  };

  return <Button onClick={logout}>Logout</Button>;
}
