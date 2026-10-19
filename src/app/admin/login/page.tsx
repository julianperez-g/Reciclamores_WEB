"use client";

import Image from "next/image";
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

  if (
    !value.startsWith("/admin") ||
    value.startsWith("//") ||
    value === "/admin/login"
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


      if (signInError) {
        throw new Error(
          "Correo o contraseña incorrectos."
        );
      }


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

    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible iniciar sesión."
      );

      setLoading(false);
    }
  }


  return (
    <main className="admin-login-page">

      <section className="admin-login-panel">

        <div className="admin-login-panel-inner">

          <Link
            href="/"
            className="admin-login-logo"
          >
            <Image
              src="/brand/reciclamores-logo.png"
              alt="Reciclamores ONG"
              width={250}
              height={90}
              priority
            />
          </Link>


          <div className="admin-login-heading">

            <p className="admin-login-kicker">
              PANEL ADMINISTRATIVO
            </p>


            <h1>
              Bienvenido
              <span>
                de nuevo.
              </span>
            </h1>


            <p>
              Ingresa con tu cuenta autorizada
              para administrar la guía digital
              de residuos.
            </p>

          </div>


          <form
            className="admin-login-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="admin-login-field">

              <label htmlFor="admin-email">
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
                placeholder="correo@reciclamores.org"
                required
              />

            </div>


            <div className="admin-login-field">

              <label htmlFor="admin-password">
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
              <span>
                {loading
                  ? "Verificando..."
                  : "Ingresar al CMS"}
              </span>

              {!loading && (
                <b>
                  →
                </b>
              )}
            </button>

          </form>


          <div className="admin-login-footer">

            <span>
              Acceso exclusivo para
              administradores autorizados.
            </span>


            <Link href="/">
              ← Volver a la guía
            </Link>

          </div>

        </div>

      </section>


      <aside className="admin-login-visual">

        <div className="admin-login-number">
          01
        </div>


        <div className="admin-login-star">
          ✦
        </div>


        <div className="admin-login-scribble">
          ∿
        </div>


        <div className="admin-login-visual-content">

          <p>
            ¿Y ESTO DÓNDE VA?
          </p>


          <h2>
            La guía cambia
            <span>
              con las dudas reales.
            </span>
          </h2>


          <div className="admin-login-features">

            <div>
              <span>
                01
              </span>

              <strong>
                Residuos
              </strong>

              <p>
                Crear, editar y publicar fichas.
              </p>
            </div>


            <div>
              <span>
                02
              </span>

              <strong>
                Necesidades
              </strong>

              <p>
                Entender qué busca la comunidad.
              </p>
            </div>


            <div>
              <span>
                03
              </span>

              <strong>
                Preguntas
              </strong>

              <p>
                Mantener las respuestas al día.
              </p>
            </div>

          </div>

        </div>

      </aside>

    </main>
  );
}