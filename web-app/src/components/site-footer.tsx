import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <strong>Gym Tracker</strong>
          <p>
            App de seguimiento PPL con cuentas verificadas por email, autenticación en Supabase y
            datos de entrenamiento aislados por usuario.
          </p>
        </div>

        <div className="site-footer-links">
          <strong>Información</strong>
          <Link href="/privacy">Privacidad</Link>
          <Link href="/terms">Términos</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/security">Seguridad</Link>
        </div>

        <div className="site-footer-links">
          <strong>Uso</strong>
          <Link href="/">Inicio</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/settings">Ajustes</Link>
          <a href="mailto:legal@gymtracker.local">Contacto legal</a>
        </div>
      </div>
    </footer>
  );
}
