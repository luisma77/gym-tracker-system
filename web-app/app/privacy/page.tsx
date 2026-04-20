export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <section className="card stack legal-card">
        <span className="pill">Privacidad</span>
        <h1>Política de privacidad</h1>
        <p>
          Gym Tracker trata los datos de cuenta, sesiones, series y medidas corporales con la
          finalidad de prestar la funcionalidad de seguimiento del entrenamiento.
        </p>
        <p>
          La autenticación se gestiona con Supabase Auth. Las contraseñas no se almacenan en tablas
          ordinarias de la aplicación y su gestión queda delegada al proveedor de autenticación.
        </p>
        <p>
          Los datos de entrenamiento se guardan en tablas separadas y protegidas con políticas de
          acceso por usuario para que cada cuenta solo pueda consultar y modificar sus propios
          registros.
        </p>
      </section>
    </main>
  );
}
