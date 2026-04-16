"use client";

import { cn } from "@/lib/utils";
import { signUpUser } from "@/src/services/authClientService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      await signUpUser({
        email,
        password,
        redirectUrl: `${window.location.origin}/admin/reportes`,
      });
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img
              src="/images/logo-sic.png"
              alt="UNNE"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Sistema de Gestión
            </CardTitle>
            <CardDescription className="text-gray-500">
              Cree su cuenta institucional
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-700">
                  Correo institucional
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@unne.edu.ar"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-gray-700">
                    Contraseña
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password" className="text-gray-700">
                    Repetir contraseña
                  </Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Ingresar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
