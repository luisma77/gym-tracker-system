import { FeatureGrid } from "@/components/feature-grid";
import { appConfig } from "@/lib/config";

const userBenefits = [
  "Guarda tus entrenamientos y vuelve a consultarlos cuando quieras.",
  "Registra peso, repeticiones y RIR en pocos pasos.",
  "Consulta tu progreso sin depender del Excel cada dia.",
  "Mantiene una base lista para futuras exportaciones y mejoras."
];

const userFlow = [
  "Crea tu cuenta.",
  "Inicia sesion.",
  "Registra tu entrenamiento del dia.",
  "Consulta tu historial y progreso."
];

const securityInfo = [
  "Tus credenciales no se guardan en texto plano.",
  "Cada usuario trabaja con sus propios datos aislados.",
  "Las entradas se validan antes de guardarse.",
  "La aplicacion esta preparada para reforzar aun mas la seguridad en siguientes versiones."
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Gym Tracker</span>
        <h1>Tu registro de entrenamiento, mas claro, mas rapido y siempre a mano.</h1>
        <p>
          Guarda tus sesiones, revisa tu historial y sigue tu progreso desde una web pensada para
          usarla de verdad, no para pelearte con hojas y celdas.
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

      <section className="card stack footer-panel">
        <span className="pill">Informacion de seguridad</span>
        <h2>Tu informacion y tus registros</h2>
        {securityInfo.map((item) => (
          <p key={item}>{item}</p>
        ))}
        <p>Servicio actual de la app: {appConfig.apiUrl}</p>
      </section>
    </main>
  );
}
