"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  getCurrentAdmin,
} from "@/lib/admin/auth";

import {
  supabase,
} from "@/lib/supabase/client";


function getSafeNext(
  value: string | null
) {
  if (!value) {
    return "/admin";
  }


  /*
   * Solo permitimos redirecciones
   * internas hacia el CMS.
   *
   * Evita open redirects.
   */
  if (
    !value.startsWith(
      "/admin"
    ) ||
    value.startsWith(
      "//"
    ) ||
    value ===
      "/admin/login"
  ) {
    return "/admin";
  }


  return value;
}


export default function AdminLoginPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);


    try {
      const {
        error:
          signInError,
      } =
        await supabase.auth
          .signInWithPassword({
            email:
              email.trim(),

            password,
          });


      if (
        signInError
      ) {
        throw new Error(
          "Correo o contraseña incorrectos."
        );
      }


      /*
       * Iniciar sesión en Supabase no basta.
       *
       * También comprobamos que ese usuario
       * sea administrador del CMS.
       */
      const admin =
        await getCurrentAdmin();


      if (!admin) {
        await supabase.auth.signOut();


        throw new Error(
          "Este usuario no tiene permisos para acceder al panel administrativo."
        );
      }


      const destination =
        getSafeNext(
          searchParams.get(
            "next"
          )
        );


      router.replace(
        destination
      );

      router.refresh();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión."
      );

      setLoading(false);
    }
  }


  return (
    <main className="admin-login-page">

      <section className="admin-login-card">

        <div className="admin-login-brand">

          <div className="admin-login-logo">

            <strong>
              Reciclamores
            </strong>

            <span>
              CMS
            </span>

          </div>


          <p>
            PANEL ADMINISTRATIVO
          </p>

        </div>


        <div className="admin-login-heading">

          <h1>
            Iniciar sesión
          </h1>

          <p>
            Accede al panel para administrar
            residuos, necesidades y preguntas
            frecuentes.
          </p>

        </div>


        <form
          className="admin-login-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="admin-login-field">

            <label
              htmlFor="admin-email"
            >
              Correo electrónico
            </label>

            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="nombre@reciclamores.org"
              required
            />

          </div>


          <div className="admin-login-field">

            <label
              htmlFor="admin-password"
            >
              Contraseña
            </label>


            <div className="admin-password-field">

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Tu contraseña"
                required
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
              >
                {showPassword
                  ? "Ocultar"
                  : "Ver"}
              </button>

            </div>

          </div>


          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="admin-login-submit"
            disabled={
              loading
            }
          >
            {loading
              ? "Verificando..."
              : "Ingresar al CMS"}
          </button>

        </form>


        <div className="admin-login-footer">

          <span>
            Acceso exclusivo para
            administradores autorizados.
          </span>


          <Link
            href="/"
          >
            ← Volver a la guía
          </Link>

        </div>

      </section>


      <aside className="admin-login-visual">

        <div className="admin-login-visual-content">

          <span className="admin-login-visual-kicker">
            ¿Y ESTO DÓNDE VA?
          </span>


          <h2>
            La guía cambia.
            <br />
            El contenido también.
          </h2>


          <p>
            Desde este panel Reciclamores
            puede mantener la información
            actualizada sin tocar código.
          </p>


          <div className="admin-login-feature-grid">

            <div>
              <strong>
                Residuos
              </strong>

              <span>
                Crear y actualizar fichas
              </span>
            </div>


            <div>
              <strong>
                Necesidades
              </strong>

              <span>
                Detectar nuevas dudas
              </span>
            </div>


            <div>
              <strong>
                FAQs
              </strong>

              <span>
                Administrar respuestas
              </span>
            </div>

          </div>

        </div>

      </aside>

    </main>
  );
}