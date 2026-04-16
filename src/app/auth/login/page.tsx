import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
