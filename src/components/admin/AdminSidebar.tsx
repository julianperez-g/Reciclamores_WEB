"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function AdminSidebar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  async function cerrarSesion() {
    await supabase.auth.signOut();

    router.replace(
      "/admin/login"
    );

    router.refresh();
  }

  function navClass(
    route: string
  ) {
    const activo =
      route === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(
            route
          );

    return activo
      ? "admin-nav-item admin-nav-item-active"
      : "admin-nav-item";
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <strong>
          Reciclamores
        </strong>

        <span>
          CMS
        </span>
      </div>

      <nav className="admin-nav">
        <Link
          href="/admin"
          className={
            navClass(
              "/admin"
            )
          }
        >
          Dashboard
        </Link>

        <button
          type="button"
          className="admin-nav-item admin-nav-item-disabled"
          disabled
        >
          <span>
            Residuos
          </span>

          <small>
            Próximo
          </small>
        </button>

        <Link
          href="/admin/necesidades"
          className={
            navClass(
              "/admin/necesidades"
            )
          }
        >
          Necesidades
        </Link>

        <button
          type="button"
          className="admin-nav-item admin-nav-item-disabled"
          disabled
        >
          <span>
            Preguntas frecuentes
          </span>

          <small>
            Próximo
          </small>
        </button>
      </nav>

      <button
        type="button"
        className="admin-logout-button"
        onClick={
          cerrarSesion
        }
      >
        Cerrar sesión
      </button>
    </aside>
  );
}