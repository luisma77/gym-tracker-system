"use client";

import { useEffect, useState } from "react";

import { createLegalContactMessage } from "@/lib/api";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function ContactPage() {
  const { user } = useAuthUser();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [subject, setSubject] = useState("Consulta legal o privacidad");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFeedback(null);

    try {
      await createLegalContactMessage({
        full_name: fullName,
        email,
        subject,
        message,
      });
      setFeedback({ type: "success", text: "Tu mensaje se ha guardado y queda registrado para revisión." });
      setMessage("");
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "No se ha podido enviar tu mensaje.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="legal-page">
      <section className="card stack legal-card">
        <span className="pill">Contacto legal</span>
        <h1>Contacto legal y privacidad</h1>
        <p>
          Usa este formulario para consultas sobre privacidad, tratamiento de datos, uso de la cuenta o incidencias legales relacionadas con tu información.
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="grid split">
            <label className="field">
              <span>Nombre</span>
              <input onChange={(event) => setFullName(event.target.value)} value={fullName} />
            </label>
            <label className="field">
              <span>Email</span>
              <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </label>
          </div>

          <label className="field">
            <span>Asunto</span>
            <input onChange={(event) => setSubject(event.target.value)} value={subject} />
          </label>

          <label className="field">
            <span>Mensaje</span>
            <textarea
              className="textarea textarea-compact"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explica tu consulta o incidencia."
              value={message}
            />
          </label>

          {feedback ? <p className={`feedback ${feedback.type}`}>{feedback.text}</p> : null}

          <button className="button primary button-fit" disabled={sending} type="submit">
            {sending ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </section>
    </main>
  );
}
