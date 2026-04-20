export default function SecurityPage() {
  return (
    <main className="legal-page">
      <section className="card stack legal-card">
        <span className="pill">Seguridad</span>
        <h1>Información de seguridad</h1>
        <p>
          El acceso se apoya en Supabase Auth con verificación por correo electrónico y gestión
          segura de credenciales. La aplicación no expone contraseñas en listados de datos ni las
          almacena en texto plano.
        </p>
        <p>
          El almacenamiento de sesiones, series y medidas se protege con Row Level Security para que
          cada usuario solo pueda operar sobre sus propios datos.
        </p>
        <p>
          También se validan entradas numéricas en la interfaz antes de enviarlas, reduciendo el
          riesgo de datos corruptos o valores incompletos.
        </p>
      </section>
    </main>
  );
}
