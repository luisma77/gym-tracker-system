const features = [
  {
    title: "Ciclo PPL real",
    description: "Empuje, tiron, pierna, empuje, tiron, pierna dentro de una estructura de 12 semanas."
  },
  {
    title: "Dia completo",
    description: "Registra varios ejercicios con varias series dentro de una sola sesion."
  },
  {
    title: "Sugerencias de progresion",
    description: "La app prioriza recomendaciones de carga, reps y RIR a partir de tu historial."
  },
  {
    title: "Control de volumen",
    description: "Detecta musculos atrasados, volumen bajo y estado semanal por grupo muscular."
  }
];

export function FeatureGrid() {
  return (
    <section>
      <h2 className="section-title">Base del sistema PPL</h2>
      <div className="grid feature-grid">
        {features.map((feature) => (
          <article className="card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
