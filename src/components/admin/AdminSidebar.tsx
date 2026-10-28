"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase/client";


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

      <div className="admin-sidebar-top">

        <Link
          href="/admin"
          className="admin-sidebar-brand"
        >
          <Image
            src="/brand/reciclamores-logo.png"
            alt="Reciclamores ONG"
            width={210}
            height={80}
            priority
          />

          <span>
            CMS
          </span>
        </Link>


        <p className="admin-sidebar-label">
          CONTENIDO
        </p>


        <nav className="admin-nav">

          <Link
            href="/admin"
            className={
              navClass(
                "/admin"
              )
            }
          >
            <span className="admin-nav-index">
              01
            </span>

            <span>
              Dashboard
            </span>
          </Link>


          <Link
            href="/admin/residuos"
            className={
              navClass(
                "/admin/residuos"
              )
            }
          >
            <span className="admin-nav-index">
              02
            </span>

            <span>
              Residuos
            </span>
          </Link>


          <Link
            href="/admin/necesidades"
            className={
              navClass(
                "/admin/necesidades"
              )
            }
          >
            <span className="admin-nav-index">
              03
            </span>

            <span>
              Necesidades
            </span>
          </Link>


          <Link
            href="/admin/faqs"
            className={
              navClass(
                "/admin/faqs"
              )
            }
          >
            <span className="admin-nav-index">
              04
            </span>

            <span>
              Preguntas
            </span>
          </Link>

        </nav>

      </div>


      <div className="admin-sidebar-bottom">

        <Link
          href="/"
          className="admin-sidebar-public"
          target="_blank"
        >
          <span>
            Ver guía pública
          </span>

          <b aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 17L17 7M9 7H17V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </b>
        </Link>


        <button
          type="button"
          className="admin-logout-button"
          onClick={
            cerrarSesion
          }
        >
          <span>
            Cerrar sesión
          </span>

          <b aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12H19M14 7L19 12L14 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </b>
        </button>

      </div>

    </aside>
  );
}