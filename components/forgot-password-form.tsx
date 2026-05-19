"use client";

import { cn } from "@/lib/utils";
import { resetPasswordForEmail } from "@/src/services/auth/authClientService";
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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      await resetPasswordForEmail({
        email,
        redirectUrl: `${window.location.origin}/auth/update-password`,
      });
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
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
                Revisá tu correo
              </CardTitle>
              <CardDescription className="text-gray-500">
                Te enviamos las instrucciones para restablecer tu contraseña
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Si tu cuenta está registrada, recibirás un correo con el enlace
              para restablecer la contraseña.
            </p>
            <div className="mt-6 text-center text-sm text-gray-600">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-2xl">
          <CardHeader className="space-y-4">
            {/* LOGO */}
            <div className="flex justify-center">
              <img
                src="/images/logo-sic.png"
                alt="UNNE"
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* TITULOS */}
            <div className="text-center">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Restablecer contraseña
              </CardTitle>
              <CardDescription className="text-gray-500">
                Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-5">

                {/* EMAIL */}
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
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                {/* BOTON */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </div>

              {/* VOLVER AL LOGIN */}
              <div className="mt-6 text-center text-sm text-gray-600">
                ¿Recordaste tu contraseña?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
