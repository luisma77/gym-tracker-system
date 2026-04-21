"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ApiRequestError,
  changePassword,
  deleteAllRecords,
  deleteOwnAccount,
  fetchProfile,
  signOutUser,
  updateProfile,
} from "@/lib/api";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  saveAuthSession,
  type StoredAuthUser,
} from "@/lib/auth-storage";

type ProfileDraft = {
  full_name: string;
  username: string;
  email: string;
};

const emptyProfile: ProfileDraft = {
  full_name: "",
  username: "",
  email: "",
};

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmDeleteRecords, setConfirmDeleteRecords] = useState(false);

  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  useEffect(() => {
    const stored = getAuthToken();
    if (!stored) {
      router.replace("/login");
      return;
    }

    setToken(stored);

    fetchProfile()
      .then((profile) => {
        setProfileDraft({
          full_name: profile.full_name ?? "",
          username: profile.username ?? "",
          email: profile.email ?? "",
        });
      })
      .catch((error) => {
        setProfileError(
          error instanceof ApiRequestError ? error.message : "No se ha podido cargar tu perfil."
        );
      })
      .finally(() => setProfileLoading(false));
  }, [router]);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const updated = await updateProfile({
        full_name: profileDraft.full_name,
        username: profileDraft.username,
      });
      const storedUser = getStoredUser<StoredAuthUser>();
      if (token && storedUser) {
        saveAuthSession(token, {
          ...storedUser,
          full_name: updated.full_name,
          username: updated.username,
          email: updated.email,
        });
      }
      setProfileSuccess("Perfil actualizado. Tu nombre y tu usuario ya están guardados.");
      router.refresh();
    } catch (error) {
      setProfileError(
        error instanceof ApiRequestError ? error.message : "No se ha podido guardar tu perfil."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const result = await changePassword(token, currentPassword, newPassword);
      setPasswordSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof ApiRequestError ? error.message : "No se ha podido cambiar la contraseña."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteRecords() {
    if (!token) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteAllRecords(token);
      setConfirmDeleteRecords(false);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof ApiRequestError ? error.message : "No se han podido eliminar los registros."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteAccountLoading(true);
    setDeleteAccountError("");

    try {
      await deleteOwnAccount();
      clearAuthSession();
      router.replace("/login?deleted=1");
      router.refresh();
    } catch (error) {
      setDeleteAccountError(
        error instanceof ApiRequestError ? error.message : "No se ha podido borrar la cuenta."
      );
    } finally {
      setDeleteAccountLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOutUser();
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Perfil</span>
        <h1>Perfil y ajustes</h1>
        <p>
          Gestiona tus datos de cuenta, cambia la contraseña y controla tanto tus registros como la
          eliminación permanente de la cuenta.
        </p>
        <div className="hero-actions">
          <Link className="button secondary" href="/dashboard">
            Volver al panel
          </Link>
          <button className="button primary" onClick={handleLogout} type="button">
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="grid split dashboard-panels">
        <article className="card stack" id="perfil">
          <span className="pill">Perfil</span>
          <h2>Tus datos visibles</h2>
          <p>Tu nombre se usa dentro de la app y tu usuario único también sirve para iniciar sesión.</p>
          {profileLoading ? <p>Cargando tu perfil...</p> : null}
          <form className="form-grid" onSubmit={handleProfileSave}>
            <label className="field">
              <span>Nombre completo</span>
              <input
                onChange={(event) =>
                  setProfileDraft((current) => ({ ...current, full_name: event.target.value }))
                }
                placeholder="Cómo quieres aparecer en la app"
                required
                type="text"
                value={profileDraft.full_name}
              />
            </label>
            <label className="field">
              <span>Nombre de usuario</span>
              <input
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    username: event.target.value.toLowerCase().replace(/\s+/g, ""),
                  }))
                }
                placeholder="Sin espacios, único"
                required
                type="text"
                value={profileDraft.username}
              />
              <small className="field-hint">
                Este valor debe ser único y te permitirá iniciar sesión en lugar del email.
              </small>
            </label>
            <label className="field">
              <span>Email</span>
              <input disabled type="email" value={profileDraft.email} />
              <small className="field-hint">
                El email sigue siendo tu identificador real para verificación y recuperación.
              </small>
            </label>
            {profileError ? <p className="feedback error">{profileError}</p> : null}
            {profileSuccess ? <p className="feedback success">{profileSuccess}</p> : null}
            <button className="button primary" disabled={profileSaving || profileLoading} type="submit">
              {profileSaving ? "Guardando..." : "Guardar perfil"}
            </button>
          </form>
        </article>

        <article className="card stack" id="seguridad">
          <span className="pill">Seguridad</span>
          <h2>Cambiar contraseña</h2>
          <p>La contraseña se actualiza directamente en Supabase Auth para mantener el acceso centralizado.</p>
          <form className="form-grid" onSubmit={handleChangePassword}>
            <label className="field">
              <span>Contraseña actual</span>
              <input
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Tu contraseña actual"
                required
                type="password"
                value={currentPassword}
              />
            </label>
            <label className="field">
              <span>Nueva contraseña</span>
              <input
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="12+ caracteres recomendados"
                required
                type="password"
                value={newPassword}
              />
            </label>
            {passwordError ? <p className="feedback error">{passwordError}</p> : null}
            {passwordSuccess ? <p className="feedback success">{passwordSuccess}</p> : null}
            <button className="button primary" disabled={passwordLoading} type="submit">
              {passwordLoading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        </article>
      </section>

      <section className="grid split dashboard-panels">
        <article className="card stack">
          <span className="pill">Registros</span>
          <h2>Borrar solo sesiones y medidas</h2>
          <p>
            Esto elimina tus sesiones, series y medidas corporales, pero conserva la cuenta para que
            sigas entrando con el mismo acceso.
          </p>
          {deleteError ? <p className="feedback error">{deleteError}</p> : null}
          {!confirmDeleteRecords ? (
            <button className="button secondary" onClick={() => setConfirmDeleteRecords(true)} type="button">
              Borrar mis registros de entrenamiento
            </button>
          ) : (
            <div className="form-grid danger-box">
              <p className="feedback error">
                ¿Seguro? Esto borrará todas tus sesiones y medidas guardadas. La cuenta seguirá existiendo.
              </p>
              <div className="hero-actions">
                <button className="button secondary" onClick={() => setConfirmDeleteRecords(false)} type="button">
                  Cancelar
                </button>
                <button className="button primary" disabled={deleteLoading} onClick={handleDeleteRecords} type="button">
                  {deleteLoading ? "Eliminando..." : "Sí, borrar registros"}
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="card stack">
          <span className="pill">Cuenta</span>
          <h2>Borrado permanente de cuenta</h2>
          <p>
            Esta opción elimina permanentemente tu cuenta y toda la información de tus sesiones. Más
            adelante podrás volver a registrarte con los mismos datos si quieres.
          </p>
          {deleteAccountError ? <p className="feedback error">{deleteAccountError}</p> : null}
          {!confirmDeleteAccount ? (
            <button className="button danger" onClick={() => setConfirmDeleteAccount(true)} type="button">
              Borrar cuenta permanentemente
            </button>
          ) : (
            <div className="form-grid danger-box">
              <p className="feedback error">
                ¿Estás seguro? Esto borrará permanentemente tu cuenta y toda la información de tus
                sesiones. No se puede deshacer.
              </p>
              <div className="hero-actions">
                <button className="button secondary" onClick={() => setConfirmDeleteAccount(false)} type="button">
                  Cancelar
                </button>
                <button
                  className="button danger"
                  disabled={deleteAccountLoading}
                  onClick={handleDeleteAccount}
                  type="button"
                >
                  {deleteAccountLoading ? "Borrando cuenta..." : "Sí, borrar cuenta"}
                </button>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
