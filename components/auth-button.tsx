import Link from "next/link";
import { Button } from "./ui/button";
import { getServerClaims } from "@/src/services/authServerService";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const { claims: user } = await getServerClaims();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
