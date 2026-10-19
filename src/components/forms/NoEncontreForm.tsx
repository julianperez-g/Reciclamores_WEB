"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  supabase,
} from "@/lib/supabase/client";


type Props = {
  initialResiduo?: string | null;
};


function normalizarTexto(
  texto:
    string |
    null |
    undefined
) {
  return (
    texto ?? ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}


export default function NoEncontreForm({
  initialResiduo,
}: Props) {
  const valorInicial =
    typeof initialResiduo === "string"
      ? initialResiduo
      : "";


  const [
    residuo,
    setResiduo,
  ] =
    useState<string>(
      valorInicial
    );


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    success,
    setSuccess,
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


    const texto =
      (
        residuo ??
        ""
      ).trim();


    if (!texto) {
      setError(
        "Escribe el residuo que estabas buscando."
      );

      return;
    }


    setLoading(true);
    setError(null);


    try {
      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            "busquedas"
          )
          .insert({
            texto_original:
              texto,

            texto_normalizado:
              normalizarTexto(
                texto
              ),

            encontro_resultado:
              false,

            residuo_id:
              null,

            origen:
              "formulario_no_encontre",
          });


      if (
        insertError
      ) {
        throw new Error(
          insertError.message
        );
      }


      setSuccess(
        true
      );

    } catch (
      caughtError
    ) {
      console.error(
        caughtError
      );


      setError(
        "No pudimos registrar la búsqueda. Intenta nuevamente."
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  const residuoMostrado =
    (
      residuo ??
      ""
    ).trim();


  if (success) {
    return (
      <div className="not-found-success">

        <div className="not-found-success-icon">
          ✓
        </div>


        <p className="not-found-eyebrow">
          BÚSQUEDA REGISTRADA
        </p>


        <h3>
          Gracias por ayudarnos
          a mejorar la guía.
        </h3>


        <p>
          Registramos{" "}

          <strong>
            “{residuoMostrado}”
          </strong>.

          {" "}

          Si más personas buscan lo mismo,
          Reciclamores podrá identificarlo
          como una necesidad prioritaria.
        </p>


        <div className="not-found-success-actions">

          <button
            type="button"
            onClick={() => {
              setResiduo(
                ""
              );

              setSuccess(
                false
              );

              setError(
                null
              );
            }}
          >
            Registrar otro
          </button>


          <Link
            href="/residuos"
          >
            Explorar la guía

            <span>
              →
            </span>
          </Link>

        </div>

      </div>
    );
  }


  return (
    <form
      className="not-found-form"
      onSubmit={
        handleSubmit
      }
    >

      <div className="not-found-form-label">

        <span>
          RESIDUO
        </span>

        <small>
          Una palabra es suficiente.
        </small>

      </div>


      <div className="not-found-input-wrap">

        <input
          type="text"
          value={
            residuo
          }
          onChange={(
            event
          ) =>
            setResiduo(
              event.target.value
            )
          }
          placeholder="Ej. colchón, pañal, maquillaje..."
          autoComplete="off"
          maxLength={120}
        />


        <span className="not-found-input-mark">
          ?
        </span>

      </div>


      <p className="not-found-form-help">
        Escríbelo como normalmente lo llamarías.
        No importa si no conoces su nombre técnico.
      </p>


      {error && (
        <div className="not-found-form-error">
          {error}
        </div>
      )}


      <button
        type="submit"
        className="not-found-submit"
        disabled={
          loading
        }
      >

        <span>
          {loading
            ? "Registrando..."
            : "Registrar mi búsqueda"}
        </span>


        {!loading && (
          <b>
            →
          </b>
        )}

      </button>


      <div className="not-found-privacy">

        <span>
          ✦
        </span>


        <p>
          No pedimos nombre, correo,
          teléfono ni ubicación.
        </p>

      </div>

    </form>
  );
}