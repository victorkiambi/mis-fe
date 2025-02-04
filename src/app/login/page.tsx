import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - MIS Dashboard",
  description: "Login to access the MIS dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoginForm />
    </div>
  );
}
