"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase/client";


export type FaqFormData = {
  id?: string;

  pregunta: string;
  respuesta: string;

  orden: number;
  activa: boolean;
};


type Props = {
  initialData:
    FaqFormData;

  mode:
    "create" |
    "edit";
};


export default function AdminFaqForm({
  initialData,
  mode,
}: Props) {
  const router =
    useRouter();


  const [
    form,
    setForm,
  ] =
    useState<FaqFormData>(
      initialData
    );


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


  const [
    success,
    setSuccess,
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
    setSuccess(null);


    try {
      const pregunta =
        form.pregunta.trim();

      const respuesta =
        form.respuesta.trim();


      if (!pregunta) {
        throw new Error(
          "La pregunta es obligatoria."
        );
      }


      if (!respuesta) {
        throw new Error(
          "La respuesta es obligatoria."
        );
      }


      if (
        !Number.isInteger(
          form.orden
        ) ||
        form.orden < 1
      ) {
        throw new Error(
          "El orden debe ser un número mayor o igual a 1."
        );
      }


      const payload = {
        pregunta,
        respuesta,

        orden:
          form.orden,

        activa:
          form.activa,
      };


      if (
        mode === "edit"
      ) {
        if (!form.id) {
          throw new Error(
            "No se pudo identificar la pregunta."
          );
        }


        const {
          error:
            updateError,
        } = await supabase
          .from("faqs")
          .update(
            payload
          )
          .eq(
            "id",
            form.id
          );


        if (
          updateError
        ) {
          throw new Error(
            updateError.message
          );
        }


        setSuccess(
          "Pregunta actualizada correctamente."
        );


        router.refresh();

        return;
      }


      const {
        data,
        error:
          insertError,
      } = await supabase
        .from("faqs")
        .insert(
          payload
        )
        .select(
          "id"
        )
        .single();


      if (
        insertError ||
        !data
      ) {
        throw new Error(
          insertError?.message ??
          "No fue posible crear la pregunta."
        );
      }


      setSuccess(
        form.activa
          ? "Pregunta creada y publicada."
          : "Pregunta creada como inactiva."
      );


      setTimeout(
        () => {
          router.replace(
            `/admin/faqs/${data.id}/editar`
          );

          router.refresh();
        },
        500
      );

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la pregunta."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <form
      className="admin-faq-form"
      onSubmit={
        handleSubmit
      }
    >

      <section className="admin-form-section">

        <div className="admin-form-section-heading">

          <div>

            <span className="admin-form-number">
              01
            </span>

            <div>

              <h2>
                Contenido
              </h2>

              <p>
                Pregunta y respuesta que verá
                el usuario en la guía.
              </p>

            </div>

          </div>

        </div>


        <div className="admin-field">

          <label>
            Pregunta *
          </label>

          <textarea
            rows={3}
            value={
              form.pregunta
            }
            onChange={(
              event
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,

                  pregunta:
                    event.target.value,
                })
              )
            }
            placeholder="Ej. ¿Todo lo que tiene el símbolo de reciclaje se recicla?"
          />

        </div>


        <div className="admin-field">

          <label>
            Respuesta *
          </label>

          <textarea
            rows={8}
            value={
              form.respuesta
            }
            onChange={(
              event
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,

                  respuesta:
                    event.target.value,
                })
              )
            }
            placeholder="Escribe una respuesta clara y corta..."
          />


          <small className="admin-field-help">
            Mantén un lenguaje sencillo y
            directo para el usuario.
          </small>

        </div>

      </section>


      <section className="admin-form-section">

        <div className="admin-form-section-heading">

          <div>

            <span className="admin-form-number">
              02
            </span>

            <div>

              <h2>
                Publicación
              </h2>

              <p>
                Define el orden y si la pregunta
                aparece públicamente.
              </p>

            </div>

          </div>

        </div>


        <div className="admin-faq-publication-grid">

          <div className="admin-field">

            <label>
              Orden
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={
                form.orden
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,

                    orden:
                      Number(
                        event.target.value
                      ),
                  })
                )
              }
            />


            <small className="admin-field-help">
              Las preguntas con números menores
              aparecen primero.
            </small>

          </div>


          <label className="admin-faq-active-card">

            <input
              type="checkbox"
              checked={
                form.activa
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,

                    activa:
                      event.target.checked,
                  })
                )
              }
            />


            <div>

              <strong>
                Mostrar públicamente
              </strong>

              <span>
                {form.activa
                  ? "La pregunta aparecerá en la sección de FAQs."
                  : "La pregunta quedará guardada pero oculta."}
              </span>

            </div>

          </label>

        </div>

      </section>


      {error && (
        <div className="admin-page-error">
          {error}
        </div>
      )}


      {success && (
        <div className="admin-form-success">
          ✓ {success}
        </div>
      )}


      <div className="admin-form-savebar">

        <div>

          <strong>
            {mode === "edit"
              ? "Editando pregunta"
              : "Nueva pregunta"}
          </strong>


          <span>
            {form.activa
              ? "Los cambios serán visibles públicamente."
              : "La pregunta permanecerá oculta."}
          </span>

        </div>


        <div className="admin-form-actions">

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() =>
              router.push(
                "/admin/faqs"
              )
            }
          >
            Cancelar
          </button>


          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              loading
            }
          >
            {loading
              ? "Guardando..."
              : mode === "edit"
              ? "Guardar cambios"
              : "Crear pregunta"}
          </button>

        </div>

      </div>

    </form>
  );
}