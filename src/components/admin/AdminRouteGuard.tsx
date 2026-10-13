"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  getCurrentAdmin,
} from "@/lib/admin/auth";

import {
  supabase,
} from "@/lib/supabase/client";


type Props = {
  children: ReactNode;
};


type GuardState =
  | "checking"
  | "authorized"
  | "login";


export default function AdminRouteGuard({
  children,
}: Props) {
  const pathname =
    usePathname();

  const router =
    useRouter();


  const [
    state,
    setState,
  ] =
    useState<GuardState>(
      "checking"
    );


  useEffect(() => {
    let active =
      true;


    const isLoginPage =
      pathname ===
      "/admin/login";


    async function verificarAcceso() {
      setState(
        "checking"
      );


      /*
       * getCurrentAdmin ya comprueba:
       *
       * 1. Que exista usuario autenticado.
       * 2. Que ese usuario tenga permisos
       *    administrativos.
       */
      const admin =
        await getCurrentAdmin();


      if (!active) {
        return;
      }


      /*
       * LOGIN
       *
       * Si ya existe una sesión administrativa,
       * no tiene sentido mostrar nuevamente
       * la pantalla de login.
       */
      if (isLoginPage) {
        if (admin) {
          router.replace(
            "/admin"
          );

          return;
        }


        setState(
          "login"
        );

        return;
      }


      /*
       * RUTAS PROTEGIDAS
       *
       * Si no hay administrador válido,
       * cerramos cualquier sesión residual
       * y enviamos al login.
       */
      if (!admin) {
        await supabase.auth.signOut();


        const next =
          encodeURIComponent(
            pathname
          );


        router.replace(
          `/admin/login?next=${next}`
        );

        return;
      }


      setState(
        "authorized"
      );
    }


    verificarAcceso();


    /*
     * Si la sesión se cierra o expira mientras
     * el administrador tiene abierto el CMS,
     * reaccionamos inmediatamente.
     */
    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          event
        ) => {
          if (
            event ===
              "SIGNED_OUT" &&
            !isLoginPage
          ) {
            setState(
              "checking"
            );

            router.replace(
              "/admin/login"
            );
          }
        }
      );


    return () => {
      active =
        false;


      authListener
        .subscription
        .unsubscribe();
    };

  }, [
    pathname,
    router,
  ]);


  /*
   * Muy importante:
   *
   * Mientras comprobamos la sesión NO
   * renderizamos las páginas administrativas.
   */
  if (
    state ===
    "checking"
  ) {
    return (
      <main className="admin-auth-check">

        <div className="admin-auth-check-card">

          <div className="admin-auth-spinner" />

          <strong>
            Verificando acceso
          </strong>

          <span>
            Panel administrativo
            Reciclamores
          </span>

        </div>

      </main>
    );
  }


  /*
   * /admin/login puede renderizarse
   * únicamente si no existe una sesión
   * administrativa válida.
   */
  if (
    state ===
    "login"
  ) {
    return (
      <>
        {children}
      </>
    );
  }


  /*
   * Todo lo demás dentro de /admin
   * requiere administrador válido.
   */
  return (
    <>
      {children}
    </>
  );
}