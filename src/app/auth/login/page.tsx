import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
