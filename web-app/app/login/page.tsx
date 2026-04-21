import { Suspense } from "react";
import { AuthClientForm } from "@/components/auth-client-form";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthClientForm mode="login" />
    </Suspense>
  );
}
