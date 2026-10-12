"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type NoEncontreFormProps = {
  residuoInicial: string;
};

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function NoEncontreForm({
  residuoInicial,
}: NoEncontreFormProps) {
  const [residuo, setResiduo] =
    useState(residuoInicial);

  const [enviando, setEnviando] =
    useState(false);

  const [enviado, setEnviado] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const texto = residuo.trim();

    if (texto.length < 2) {
      setError(
        "Escribe el nombre del residuo que estabas buscando."
      );

      return;
    }

    setEnviando(true);
    setError(null);

    const { error: insertError } =
      await supabase
        .from("busquedas")
        .insert({
          texto_original: texto,
          texto_normalizado:
            normalizarTexto(texto),
          encontro_resultado: false,
          residuo_id: null,
          origen:
            "formulario_no_encontre",
        });

    if (insertError) {
      console.error(
        "Error registrando búsqueda:",
        insertError
      );

      setError(
        "No pudimos registrar tu búsqueda. Inténtalo nuevamente."
      );

      setEnviando(false);

      return;
    }

    setEnviado(true);
    setEnviando(false);
  }

  if (enviado) {
    return (
      <section className="not-found-success">
        <div className="not-found-success-icon">
          ✓
        </div>

        <div>
          <p className="not-found-success-label">
            BÚSQUEDA REGISTRADA
          </p>

          <h2>
            Gracias por ayudarnos.
          </h2>

          <p>
            Registramos{" "}
            <strong>
              “{residuo.trim()}”
            </strong>
            . Esta información ayudará a Reciclamores
            a decidir qué nuevas fichas crear.
          </p>

          <Link
            href="/"
            className="not-found-home-button"
          >
            Volver a buscar →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      className="not-found-form"
      onSubmit={manejarEnvio}
    >
      <label htmlFor="residuo">
        ¿Qué residuo estabas buscando?
      </label>

      <div className="not-found-input-group">
        <input
          id="residuo"
          name="residuo"
          type="text"
          value={residuo}
          onChange={(event) =>
            setResiduo(event.target.value)
          }
          placeholder="Ej: aerosol, pañal, cuchilla..."
          maxLength={250}
          autoComplete="off"
          disabled={enviando}
        />

        <button
          type="submit"
          disabled={
            enviando ||
            residuo.trim().length < 2
          }
        >
          {enviando
            ? "Enviando..."
            : "Enviar"}
        </button>
      </div>

      <div className="not-found-counter">
        {residuo.length}/250
      </div>

      {error && (
        <p className="not-found-error">
          {error}
        </p>
      )}
    </form>
  );
}