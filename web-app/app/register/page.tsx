import { Suspense } from "react";
import { AuthClientForm } from "@/components/auth-client-form";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthClientForm mode="register" />
    </Suspense>
  );
}
