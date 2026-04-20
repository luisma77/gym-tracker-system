"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiRequestError, changePassword, deleteAllRecords } from "@/lib/api";
import { clearAuthSession, getAuthToken } from "@/lib/auth-storage";

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const stored = getAuthToken();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setToken(stored);
  }, [router]);

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const result = await changePassword(token, currentPassword, newPassword);
      setPasswordSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof ApiRequestError ? err.message : "No se ha podido cambiar la contrasena."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteRecords() {
    if (!token) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAllRecords(token);
      setConfirmDelete(false);
      router.push("/dashboard");
    } catch (err) {
      setDeleteError(
        err instanceof ApiRequestError ? err.message : "No se han podido eliminar los registros."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Configuracion</span>
        <h1>Ajustes de cuenta</h1>
        <p>Gestiona tu contrasena y tus datos de entrenamiento.</p>
        <div className="hero-actions">
          <a className="button secondary" href="/dashboard">
            Volver al panel
          </a>
          <button className="button primary" onClick={handleLogout} type="button">
            Cerrar sesion
          </button>
        </div>
      </section>

      <section className="grid split dashboard-panels">
        <article className="card stack">
          <span className="pill">Seguridad</span>
          <h2>Cambiar contrasena</h2>
          <form className="form-grid" onSubmit={handleChangePassword}>
            <label className="field">
              <span>Contrasena actual</span>
              <input
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contrasena actual"
                required
                type="password"
                value={currentPassword}
              />
            </label>
            <label className="field">
              <span>Nueva contrasena</span>
              <input
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="12+ caracteres recomendados"
                required
                type="password"
                value={newPassword}
              />
            </label>
            {passwordError ? <p className="feedback error">{passwordError}</p> : null}
            {passwordSuccess ? <p className="feedback success">{passwordSuccess}</p> : null}
            <button className="button primary" disabled={passwordLoading} type="submit">
              {passwordLoading ? "Guardando..." : "Cambiar contrasena"}
            </button>
          </form>
        </article>

        <article className="card stack">
          <span className="pill">Zona de peligro</span>
          <h2>Eliminar registros</h2>
          <p>
            Esto eliminara permanentemente todas tus sesiones de entrenamiento y sus series. Esta accion no se puede deshacer.
          </p>
          {deleteError ? <p className="feedback error">{deleteError}</p> : null}
          {!confirmDelete ? (
            <button
              className="button primary"
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              Borrar todos mis registros de entrenamiento
            </button>
          ) : (
            <div className="form-grid">
              <p className="feedback error">
                ¿Estas seguro? Esta accion eliminara todos tus registros de entrenamiento de forma permanente.
              </p>
              <div className="hero-actions">
                <button
                  className="button secondary"
                  onClick={() => setConfirmDelete(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="button primary"
                  disabled={deleteLoading}
                  onClick={handleDeleteRecords}
                  type="button"
                >
                  {deleteLoading ? "Eliminando..." : "Si, eliminar todo"}
                </button>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
