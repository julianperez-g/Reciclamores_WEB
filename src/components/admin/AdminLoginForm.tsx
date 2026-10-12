"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw new Error(
          "El correo o la contraseña no son correctos."
        );
      }

      if (!data.user) {
        throw new Error(
          "No fue posible iniciar sesión."
        );
      }

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select(`
          user_id,
          nombre,
          activo
        `)
        .eq(
          "user_id",
          data.user.id
        )
        .eq(
          "activo",
          true
        )
        .maybeSingle();

      if (
        adminError ||
        !admin
      ) {
        await supabase.auth.signOut();

        throw new Error(
          "Tu usuario no tiene acceso al panel administrativo."
        );
      }

      router.push("/admin");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="admin-login-form"
      onSubmit={handleSubmit}
    >
      <div className="admin-field">
        <label htmlFor="admin-email">
          Correo electrónico
        </label>

        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="admin-field">
        <label htmlFor="admin-password">
          Contraseña
        </label>

        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          placeholder="Tu contraseña"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div
          className="admin-login-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="admin-login-button"
        disabled={loading}
      >
        {loading
          ? "Ingresando..."
          : "Entrar al CMS"}
      </button>
    </form>
  );
}