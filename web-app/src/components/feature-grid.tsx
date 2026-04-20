const features = [
  {
    title: "Entrenamiento del dia",
    description: "Registra la sesion que acabas de hacer sin perder tiempo navegando entre hojas."
  },
  {
    title: "Registro por serie",
    description: "Guarda carga, repeticiones y RIR para tener un historial real de cada ejercicio."
  },
  {
    title: "Historial y progreso",
    description: "Consulta tus ultimas sesiones y entiende mejor como estas avanzando."
  },
  {
    title: "Base preparada para crecer",
    description: "La app ya esta lista para seguir evolucionando con mas automatizaciones y exportaciones."
  }
];

export function FeatureGrid() {
  return (
    <section>
      <h2 className="section-title">Base del MVP</h2>
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
