import Link from "next/link";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <Link
          href="/"
          className="back-link"
        >
          ← Volver a la guía
        </Link>

        <section className="admin-login-card">
          <div className="admin-login-brand">
            <span className="admin-login-brand-name">
              Reciclamores
            </span>

            <span className="admin-login-brand-label">
              CMS
            </span>
          </div>

          <div className="admin-login-copy">
            <p className="eyebrow">
              PANEL ADMINISTRATIVO
            </p>

            <h1>
              Gestiona la guía
            </h1>

            <p>
              Acceso exclusivo para el
              equipo autorizado de
              Reciclamores.
            </p>
          </div>

          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}