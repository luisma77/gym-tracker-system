import { FeatureGrid } from "@/components/feature-grid";

const userBenefits = [
  "Sigue una organizacion real de 12 semanas orientada a PPL como en tu Excel.",
  "Registra un dia completo con varios ejercicios y varias series en una sola sesion.",
  "Consulta sugerencias de progresion basadas en reps, RIR y carga previa.",
  "Detecta rapido cuando un grupo muscular lleva 2 sesiones sin tocarse."
];

const userFlow = [
  "Crea tu cuenta.",
  "Confirma tu correo y entra con Supabase Auth.",
  "Sigue el orden empuje, tiron, pierna, empuje, tiron, pierna.",
  "Registra el dia completo y revisa sugerencias y progreso."
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Inicio</span>
        <h1>Tu Excel PPL convertido en una web clara, rápida y usable desde cualquier dispositivo.</h1>
        <p>
          Gym Tracker conserva la lógica de tu sistema de entrenamiento, añade autenticación real
          con email verificado, guarda el historial en Supabase y mantiene una experiencia limpia
          tanto en móvil como en escritorio.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/register">
            Crear cuenta
          </a>
          <a className="button secondary" href="/login">
            Iniciar sesion
          </a>
        </div>
      </section>

      <FeatureGrid />

      <section className="grid split">
        <article className="card stack">
          <span className="pill">Ventajas</span>
          <h2>Que te aporta usar la app</h2>
          {userBenefits.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>

        <article className="card stack">
          <span className="pill">Uso</span>
          <h2>Como funciona</h2>
          {userFlow.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>
      </section>

      <section className="grid split">
        <article className="card stack">
          <span className="pill">Datos</span>
          <h2>Cómo se organizan tus registros</h2>
          <p>El catálogo de ejercicios nace de la hoja EJERCICIOS del Excel y puede regenerarse cuando cambie.</p>
          <p>Tus sesiones, series y medidas se guardan aparte para no mezclar catálogo general con historial personal.</p>
          <p>La app está preparada para crecer sin perder la estructura base del sistema PPL.</p>
        </article>

        <article className="card stack">
          <span className="pill">Legal</span>
          <h2>Privacidad y seguridad, mejor explicadas</h2>
          <p>La parte legal y de seguridad ya no se mezcla con la portada. Ahora vive en páginas separadas y enlazadas desde el footer.</p>
          <p>Ahí se explica el uso de Supabase Auth, el aislamiento de datos por usuario y el tratamiento de la información guardada.</p>
        </article>
      </section>
    </main>
  );
}
