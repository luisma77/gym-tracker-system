"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { ApiRequestError, loginUser, registerUser } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth-storage";

type AuthClientFormProps = {
  mode: "login" | "register";
};

export function AuthClientForm({ mode }: AuthClientFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const passwordRequirements = useMemo(
    () => [
      { label: "Minimo 12 caracteres", valid: passwordValue.length >= 12 },
      { label: "Al menos una mayuscula", valid: /[A-Z]/.test(passwordValue) },
      { label: "Al menos una minuscula", valid: /[a-z]/.test(passwordValue) },
      { label: "Al menos un numero", valid: /\d/.test(passwordValue) },
      { label: "Al menos un simbolo especial", valid: /[^A-Za-z0-9]/.test(passwordValue) },
    ],
    [passwordValue]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const fullName = String(formData.get("fullName") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    try {
      if (mode === "register") {
        await registerUser({
          email,
          username,
          full_name: fullName,
          password,
        });
        const auth = await loginUser({ identifier: email, password });
        saveAuthSession(auth.access_token, auth.user);
      } else {
        const auth = await loginUser({ identifier, password });
        saveAuthSession(auth.access_token, auth.user);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiRequestError) {
        setError(submitError.message);
        setFieldErrors(submitError.fieldErrors);
      } else {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "No se ha podido completar la operacion."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-shell">
      <article className="card auth-card">
        <span className="pill">Acceso</span>
        <h1>{mode === "login" ? "Iniciar sesion" : "Crear cuenta"}</h1>
        <p>
          {mode === "login"
            ? "Accede a tus sesiones guardadas y sigue registrando progresos."
            : "Crea tu cuenta para guardar rutinas, entrenamientos e historial. Necesitas nombre, email valido y una contrasena que cumpla todos los requisitos."}
        </p>
        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <label className="field" htmlFor="fullName">
                <span>Nombre completo</span>
                <input
                  className={fieldErrors.full_name ? "input-invalid" : ""}
                  id="fullName"
                  name="fullName"
                  placeholder="Minimo 2 caracteres"
                  type="text"
                />
                <small className="field-hint">Se usa para identificar tu cuenta dentro del panel.</small>
                {fieldErrors.full_name ? <p className="field-feedback">{fieldErrors.full_name}</p> : null}
              </label>
              <label className="field" htmlFor="username">
                <span>Nombre de usuario</span>
                <input
                  className={fieldErrors.username ? "input-invalid" : ""}
                  id="username"
                  name="username"
                  placeholder="Sin espacios, unico"
                  type="text"
                />
                <small className="field-hint">Puedes usarlo para iniciar sesion en lugar del email.</small>
                {fieldErrors.username ? <p className="field-feedback">{fieldErrors.username}</p> : null}
              </label>
              <label className="field" htmlFor="email">
                <span>Email</span>
                <input
                  className={fieldErrors.email ? "input-invalid" : ""}
                  id="email"
                  name="email"
                  placeholder="Debe ser un email valido"
                  type="email"
                />
                <small className="field-hint">
                  Sera tu identificador para entrar. En este MVP se valida el formato del email, no la existencia real del buzon.
                </small>
                {fieldErrors.email ? <p className="field-feedback">{fieldErrors.email}</p> : null}
              </label>
            </>
          ) : (
            <label className="field" htmlFor="identifier">
              <span>Email o nombre de usuario</span>
              <input
                className={fieldErrors.identifier ? "input-invalid" : ""}
                id="identifier"
                name="identifier"
                placeholder="Email o nombre de usuario"
                type="text"
              />
              <small className="field-hint">Puedes usar tu email o tu nombre de usuario.</small>
              {fieldErrors.identifier ? <p className="field-feedback">{fieldErrors.identifier}</p> : null}
            </label>
          )}
          <label className="field" htmlFor="password">
            <span>Contrasena</span>
            <input
              className={fieldErrors.password ? "input-invalid" : ""}
              id="password"
              name="password"
              onChange={(event) => setPasswordValue(event.target.value)}
              placeholder={
                mode === "register"
                  ? "12+ caracteres, mayuscula, minuscula, numero y simbolo"
                  : "Tu contrasena"
              }
              type="password"
              value={passwordValue}
            />
            <small className="field-hint">
              {mode === "register"
                ? "Debe cumplir todos los requisitos de seguridad para poder crear la cuenta."
                : "Introduce la contrasena con la que creaste tu cuenta."}
            </small>
            {fieldErrors.password ? <p className="field-feedback">{fieldErrors.password}</p> : null}
          </label>
          {mode === "register" ? (
            <div className="password-rules">
              {passwordRequirements.map((requirement) => (
                <p
                  className={`password-rule ${requirement.valid ? "valid" : "invalid"}`}
                  key={requirement.label}
                >
                  {requirement.valid ? "Cumple" : "Pendiente"} · {requirement.label}
                </p>
              ))}
            </div>
          ) : null}
          {error && Object.keys(fieldErrors).length === 0 ? (
            <p className="feedback error">{error}</p>
          ) : null}
          <button className="button primary" disabled={loading} type="submit">
            {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </article>
    </section>
  );
}
