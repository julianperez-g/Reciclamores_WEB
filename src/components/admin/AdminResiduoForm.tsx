"use client";

import {
  FormEvent,
  ReactNode,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase/client";


export type ResiduoFormData = {
  id?: string;

  nombre: string;
  slug: string;

  duda_real: string;
  respuesta_corta: string;

  estado_general:
    string | null;

  va_reciclaje_convencional:
    string | null;

  reciclaje_convencional_detalle:
    string;

  se_entrega_reciclador:
    string | null;

  reciclador_detalle:
    string;

  como_preparar: string;

  nunca_hacer: string;

  tipo_ruta:
    string | null;

  indicacion_ruta:
    string;

  fuente_tecnica:
    string;

  fuente_url:
    string;

  fecha_verificacion:
    string;

  estado_publicacion:
    "publicado" |
    "borrador";

  nivel_certeza:
    "validado" |
    "requiere_revision";

  destacado: boolean;

  orden_destacado:
    number | null;

  /*
   * Estos dos campos se mantienen aquí
   * porque la página de edición los utiliza
   * para cargar la ficha y para eliminarla.
   *
   * IMPORTANTE:
   * AdminResiduoForm NO los guarda.
   * La imagen pertenece exclusivamente
   * a AdminResiduoImageManager.
   */
  imagen_path:
    string | null;

  imagen_alt:
    string;

  aliases: string[];
};


type Props = {
  initialData?:
    ResiduoFormData;

  prefillName?:
    string;

  prefillAliases?:
    string[];

  necesidadNormalizada?:
    string | null;

  children?:
    ReactNode;
};


function slugify(
  texto: string
) {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


function normalizarAlias(
  texto: string
) {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}


export default function AdminResiduoForm({
  initialData,
  prefillName = "",
  prefillAliases = [],
  necesidadNormalizada = null,
  children,
}: Props) {
  const router =
    useRouter();


  const [
    form,
    setForm,
  ] =
    useState<ResiduoFormData>(
      initialData ?? {
        nombre:
          prefillName,

        slug:
          slugify(
            prefillName
          ),

        duda_real: "",
        respuesta_corta: "",

        estado_general:
          null,

        va_reciclaje_convencional:
          null,

        reciclaje_convencional_detalle:
          "",

        se_entrega_reciclador:
          null,

        reciclador_detalle:
          "",

        como_preparar:
          "",

        nunca_hacer:
          "",

        tipo_ruta:
          null,

        indicacion_ruta:
          "",

        fuente_tecnica:
          "",

        fuente_url:
          "",

        fecha_verificacion:
          "",

        estado_publicacion:
          "borrador",

        nivel_certeza:
          "requiere_revision",

        destacado:
          false,

        orden_destacado:
          null,

        imagen_path:
          null,

        imagen_alt:
          "",

        aliases:
          prefillAliases,
      }
    );


  const [
    aliasesText,
    setAliasesText,
  ] =
    useState(
      (
        initialData?.aliases ??
        prefillAliases
      )
        .filter(
          Boolean
        )
        .join("\n")
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


  function setField<
    K extends keyof ResiduoFormData
  >(
    field: K,
    value:
      ResiduoFormData[K]
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [field]: value,
      })
    );
  }


  function validarPublicacion() {
    if (
      form.estado_publicacion !==
      "publicado"
    ) {
      return;
    }


    if (
      form.nivel_certeza !==
      "validado"
    ) {
      throw new Error(
        "Para publicar una ficha primero debes marcarla como validada."
      );
    }


    if (
      !form.estado_general ||
      !form.va_reciclaje_convencional ||
      !form.se_entrega_reciclador ||
      !form.tipo_ruta ||
      !form.respuesta_corta.trim() ||
      !form.fuente_tecnica.trim() ||
      !form.fecha_verificacion
    ) {
      throw new Error(
        "La ficha no tiene todavía la información mínima necesaria para publicarse."
      );
    }
  }


  async function sincronizarNecesidad(
    residuoId: string
  ) {
    const estaResuelta =
      form.estado_publicacion ===
        "publicado" &&
      form.nivel_certeza ===
        "validado";


    if (estaResuelta) {
      const {
        error:
          resolverError,
      } = await supabase
        .from("busquedas")
        .update({
          gestionada:
            true,

          gestionada_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "residuo_relacionado_id",
          residuoId
        )
        .eq(
          "encontro_resultado",
          false
        );


      if (
        resolverError
      ) {
        throw new Error(
          `La ficha se guardó, pero no fue posible cerrar la necesidad: ${resolverError.message}`
        );
      }


      return;
    }


    const {
      error:
        reabrirError,
    } = await supabase
      .from("busquedas")
      .update({
        gestionada:
          false,

        gestionada_at:
          null,
      })
      .eq(
        "residuo_relacionado_id",
        residuoId
      )
      .eq(
        "encontro_resultado",
        false
      );


    if (
      reabrirError
    ) {
      throw new Error(
        `La ficha se guardó, pero no fue posible actualizar la necesidad: ${reabrirError.message}`
      );
    }
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);


    try {
      const nombre =
        form.nombre.trim();


      if (!nombre) {
        throw new Error(
          "El nombre es obligatorio."
        );
      }


      validarPublicacion();


      const slug =
        form.slug.trim() ||
        slugify(
          nombre
        );


      /*
       * IMPORTANTE:
       *
       * Este payload NO contiene:
       *
       * imagen_path
       * imagen_alt
       * imagen_tipo
       * imagen_credito
       *
       * Esos campos son responsabilidad exclusiva
       * de AdminResiduoImageManager.
       *
       * Así evitamos que guardar los datos generales
       * de la ficha borre o sobrescriba una imagen
       * recién subida.
       */
      const payload = {
        nombre,
        slug,

        duda_real:
          form
            .duda_real
            .trim(),

        respuesta_corta:
          form
            .respuesta_corta
            .trim(),

        estado_general:
          form.estado_general,

        va_reciclaje_convencional:
          form
            .va_reciclaje_convencional,

        reciclaje_convencional_detalle:
          form
            .reciclaje_convencional_detalle
            .trim(),

        se_entrega_reciclador:
          form
            .se_entrega_reciclador,

        reciclador_detalle:
          form
            .reciclador_detalle
            .trim(),

        como_preparar:
          form
            .como_preparar
            .trim(),

        nunca_hacer:
          form
            .nunca_hacer
            .trim(),

        tipo_ruta:
          form.tipo_ruta,

        indicacion_ruta:
          form
            .indicacion_ruta
            .trim(),

        fuente_tecnica:
          form
            .fuente_tecnica
            .trim(),

        fuente_url:
          form
            .fuente_url
            .trim(),

        fecha_verificacion:
          form.fecha_verificacion ||
          null,

        estado_publicacion:
          form
            .estado_publicacion,

        nivel_certeza:
          form
            .nivel_certeza,

        destacado:
          form.destacado,

        orden_destacado:
          form.destacado
            ? form
                .orden_destacado
            : null,
      };


      let residuoId =
        form.id;


      if (form.id) {
        const {
          error:
            updateError,
        } = await supabase
          .from("residuos")
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
      } else {
        const {
          data,
          error:
            insertError,
        } = await supabase
          .from("residuos")
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
            insertError
              ?.message ??
              "No fue posible crear la ficha."
          );
        }


        residuoId =
          data.id;
      }


      if (!residuoId) {
        throw new Error(
          "No se pudo identificar la ficha."
        );
      }


      if (
        !form.id &&
        necesidadNormalizada
      ) {
        const {
          error:
            vinculacionError,
        } = await supabase
          .from("busquedas")
          .update({
            residuo_relacionado_id:
              residuoId,
          })
          .eq(
            "texto_normalizado",
            necesidadNormalizada
          )
          .eq(
            "encontro_resultado",
            false
          )
          .eq(
            "gestionada",
            false
          );


        if (
          vinculacionError
        ) {
          throw new Error(
            `La ficha fue creada, pero no se pudo vincular a la necesidad: ${vinculacionError.message}`
          );
        }
      }


      const aliases =
        aliasesText
          .split("\n")
          .map(
            (
              alias
            ) =>
              alias.trim()
          )
          .filter(
            Boolean
          );


      const aliasesUnicos =
        Array.from(
          new Map(
            aliases.map(
              (
                alias
              ) => [
                normalizarAlias(
                  alias
                ),
                alias,
              ]
            )
          ).entries()
        );


      const {
        error:
          deleteAliasesError,
      } = await supabase
        .from(
          "residuo_aliases"
        )
        .delete()
        .eq(
          "residuo_id",
          residuoId
        );


      if (
        deleteAliasesError
      ) {
        throw new Error(
          deleteAliasesError.message
        );
      }


      if (
        aliasesUnicos.length >
        0
      ) {
        const {
          error:
            insertAliasesError,
        } = await supabase
          .from(
            "residuo_aliases"
          )
          .insert(
            aliasesUnicos.map(
              ([
                aliasNormalizado,
                alias,
              ]) => ({
                residuo_id:
                  residuoId,

                alias,

                alias_normalizado:
                  aliasNormalizado,
              })
            )
          );


        if (
          insertAliasesError
        ) {
          throw new Error(
            insertAliasesError.message
          );
        }
      }


      await sincronizarNecesidad(
        residuoId
      );


      setSuccess(
        form.id
          ? "Ficha actualizada correctamente."
          : necesidadNormalizada
          ? "Borrador creado y vinculado a la necesidad."
          : "Ficha creada correctamente como borrador."
      );


      if (!form.id) {
        setTimeout(
          () => {
            router.replace(
              `/admin/residuos/${residuoId}/editar`
            );

            router.refresh();
          },
          500
        );
      } else {
        router.refresh();
      }

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <form
      className="admin-residue-form"
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
                Identificación
              </h2>

              <p>
                Cómo se presenta esta ficha
                dentro de la guía.
              </p>
            </div>
          </div>

        </div>


        <div className="admin-form-grid">

          <div className="admin-field">

            <label>
              Nombre del residuo *
            </label>

            <input
              value={
                form.nombre
              }
              onChange={(
                event
              ) => {
                const nombre =
                  event.target.value;

                setField(
                  "nombre",
                  nombre
                );

                if (!form.id) {
                  setField(
                    "slug",
                    slugify(
                      nombre
                    )
                  );
                }
              }}
              placeholder="Ej. Pañales"
            />

          </div>


          <div className="admin-field">

            <label>
              URL / slug
            </label>

            <input
              value={
                form.slug
              }
              onChange={(
                event
              ) =>
                setField(
                  "slug",
                  event
                    .target
                    .value
                )
              }
              placeholder="panales"
            />

          </div>

        </div>


        <div className="admin-field">

          <label>
            Pregunta real del usuario
          </label>

          <textarea
            rows={3}
            value={
              form.duda_real
            }
            onChange={(
              event
            ) =>
              setField(
                "duda_real",
                event.target.value
              )
            }
            placeholder="Ej. ¿Los pañales usados van en la basura normal?"
          />

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
                Criterio ambiental
              </h2>

              <p>
                Define la respuesta y
                disposición del residuo.
              </p>
            </div>

          </div>


          <span className="admin-form-warning-badge">
            Requiere validación
          </span>

        </div>


        <div className="admin-form-grid">

          <div className="admin-field">

            <label>
              Estado general
            </label>

            <select
              value={
                form.estado_general ??
                ""
              }
              onChange={(
                event
              ) =>
                setField(
                  "estado_general",
                  event.target.value ||
                  null
                )
              }
            >
              <option value="">
                Sin definir todavía
              </option>

              <option value="ruta_especial">
                Ruta especial
              </option>

              <option value="depende">
                Depende
              </option>
            </select>

          </div>


          <div className="admin-field">

            <label>
              ¿Va al reciclaje convencional?
            </label>

            <select
              value={
                form
                  .va_reciclaje_convencional ??
                ""
              }
              onChange={(
                event
              ) =>
                setField(
                  "va_reciclaje_convencional",
                  event.target.value ||
                  null
                )
              }
            >
              <option value="">
                Sin definir todavía
              </option>

              <option value="si">
                Sí
              </option>

              <option value="no">
                No
              </option>

              <option value="depende">
                Depende
              </option>

              <option value="parcialmente">
                Parcialmente
              </option>

              <option value="no_aplica">
                No aplica
              </option>
            </select>

          </div>


          <div className="admin-field">

            <label>
              ¿Se entrega a reciclador?
            </label>

            <select
              value={
                form
                  .se_entrega_reciclador ??
                ""
              }
              onChange={(
                event
              ) =>
                setField(
                  "se_entrega_reciclador",
                  event.target.value ||
                  null
                )
              }
            >
              <option value="">
                Sin definir todavía
              </option>

              <option value="si">
                Sí
              </option>

              <option value="no">
                No
              </option>

              <option value="depende">
                Depende
              </option>
            </select>

          </div>


          <div className="admin-field">

            <label>
              Tipo de ruta
            </label>

            <select
              value={
                form.tipo_ruta ??
                ""
              }
              onChange={(
                event
              ) =>
                setField(
                  "tipo_ruta",
                  event.target.value ||
                  null
                )
              }
            >
              <option value="">
                Sin definir todavía
              </option>

              <option value="salud">
                Salud
              </option>

              <option value="posconsumo">
                Posconsumo
              </option>

              <option value="raee">
                RAEE
              </option>

              <option value="gestor_autorizado">
                Gestor autorizado
              </option>

              <option value="local">
                Ruta local
              </option>

              <option value="ninguna">
                Ninguna
              </option>
            </select>

          </div>

        </div>


        <div className="admin-field">

          <label>
            Respuesta corta
          </label>

          <textarea
            rows={4}
            value={
              form.respuesta_corta
            }
            onChange={(
              event
            ) =>
              setField(
                "respuesta_corta",
                event.target.value
              )
            }
            placeholder="Respuesta principal que verá el usuario."
          />

        </div>


        <div className="admin-form-grid">

          <div className="admin-field">

            <label>
              ¿Cómo prepararlo?
            </label>

            <textarea
              rows={5}
              value={
                form.como_preparar
              }
              onChange={(
                event
              ) =>
                setField(
                  "como_preparar",
                  event.target.value
                )
              }
            />

          </div>


          <div className="admin-field">

            <label>
              Nunca hacer
            </label>

            <textarea
              rows={5}
              value={
                form.nunca_hacer
              }
              onChange={(
                event
              ) =>
                setField(
                  "nunca_hacer",
                  event.target.value
                )
              }
            />

          </div>

        </div>


        <div className="admin-field">

          <label>
            Detalle de reciclaje convencional
          </label>

          <textarea
            rows={3}
            value={
              form
                .reciclaje_convencional_detalle
            }
            onChange={(
              event
            ) =>
              setField(
                "reciclaje_convencional_detalle",
                event.target.value
              )
            }
          />

        </div>


        <div className="admin-field">

          <label>
            Detalle de entrega a reciclador
          </label>

          <textarea
            rows={3}
            value={
              form
                .reciclador_detalle
            }
            onChange={(
              event
            ) =>
              setField(
                "reciclador_detalle",
                event.target.value
              )
            }
          />

        </div>


        <div className="admin-field">

          <label>
            Indicación de ruta
          </label>

          <textarea
            rows={3}
            value={
              form
                .indicacion_ruta
            }
            onChange={(
              event
            ) =>
              setField(
                "indicacion_ruta",
                event.target.value
              )
            }
          />

        </div>

      </section>


      <section className="admin-form-section">

        <div className="admin-form-section-heading">

          <div>

            <span className="admin-form-number">
              03
            </span>

            <div>
              <h2>
                Sinónimos del buscador
              </h2>

              <p>
                Ayudan a encontrar la ficha
                aunque el usuario use otro
                nombre.
              </p>
            </div>

          </div>


          <span className="admin-form-info-badge">
            1 por línea
          </span>

        </div>


        <div className="admin-field">

          <label>
            Palabras y expresiones alternativas
          </label>

          <textarea
            className="admin-alias-textarea"
            rows={8}
            value={
              aliasesText
            }
            onChange={(
              event
            ) =>
              setAliasesText(
                event.target.value
              )
            }
            placeholder={
`aceite vegetal usado
aceite usado
aceite de cocina
AVU`
            }
          />


          <small className="admin-field-help">
            Incluye abreviaciones,
            nombres populares,
            errores comunes o formas
            alternativas de describirlo.
          </small>

        </div>

      </section>


      <section className="admin-form-section">

        <div className="admin-form-section-heading">

          <div>

            <span className="admin-form-number">
              04
            </span>

            <div>
              <h2>
                Fuente y validación
              </h2>

              <p>
                De dónde proviene el
                criterio ambiental.
              </p>
            </div>

          </div>

        </div>


        <div className="admin-field">

          <label>
            Fuente técnica
          </label>

          <input
            value={
              form
                .fuente_tecnica
            }
            onChange={(
              event
            ) =>
              setField(
                "fuente_tecnica",
                event
                  .target
                  .value
              )
            }
            placeholder="Entidad, norma o documento técnico"
          />

        </div>


        <div className="admin-form-grid">

          <div className="admin-field">

            <label>
              Fecha de verificación
            </label>

            <input
              type="date"
              value={
                form
                  .fecha_verificacion
              }
              onChange={(
                event
              ) =>
                setField(
                  "fecha_verificacion",
                  event
                    .target
                    .value
                )
              }
            />

          </div>


          <div className="admin-field">

            <label>
              URL de la fuente
            </label>

            <input
              type="url"
              value={
                form.fuente_url
              }
              onChange={(
                event
              ) =>
                setField(
                  "fuente_url",
                  event.target.value
                )
              }
              placeholder="https://..."
            />

          </div>

        </div>

      </section>


      <section className="admin-form-section admin-publication-section">

        <div className="admin-form-section-heading">

          <div>

            <span className="admin-form-number">
              05
            </span>

            <div>
              <h2>
                Publicación
              </h2>

              <p>
                Controla cuándo aparece la
                ficha para los usuarios.
              </p>
            </div>

          </div>

        </div>


        <div className="admin-form-grid">

          <div className="admin-field">

            <label>
              Estado de publicación
            </label>

            <select
              value={
                form
                  .estado_publicacion
              }
              onChange={(
                event
              ) =>
                setField(
                  "estado_publicacion",
                  event
                    .target
                    .value as
                    | "publicado"
                    | "borrador"
                )
              }
            >
              <option value="borrador">
                Borrador
              </option>

              <option value="publicado">
                Publicado
              </option>
            </select>

          </div>


          <div className="admin-field">

            <label>
              Nivel de certeza
            </label>

            <select
              value={
                form
                  .nivel_certeza
              }
              onChange={(
                event
              ) =>
                setField(
                  "nivel_certeza",
                  event
                    .target
                    .value as
                    | "validado"
                    | "requiere_revision"
                )
              }
            >
              <option value="requiere_revision">
                Requiere revisión
              </option>

              <option value="validado">
                Validado
              </option>
            </select>

          </div>

        </div>


        <label className="admin-checkbox-card">

          <input
            type="checkbox"
            checked={
              form.destacado
            }
            onChange={(
              event
            ) =>
              setField(
                "destacado",
                event
                  .target
                  .checked
              )
            }
          />


          <div>
            <strong>
              Mostrar como destacado
            </strong>

            <span>
              La ficha podrá aparecer en
              la selección principal de
              la Home.
            </span>
          </div>

        </label>


        {form.destacado && (
          <div className="admin-field admin-order-field">

            <label>
              Orden destacado
            </label>

            <input
              type="number"
              min="1"
              value={
                form
                  .orden_destacado ??
                ""
              }
              onChange={(
                event
              ) =>
                setField(
                  "orden_destacado",
                  event
                    .target
                    .value
                    ? Number(
                        event
                          .target
                          .value
                      )
                    : null
                )
              }
            />

          </div>
        )}

      </section>


      {children}


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
            {form.id
              ? "Editando ficha"
              : "Nueva ficha"}
          </strong>


          <span>
            {form.estado_publicacion ===
            "borrador"
              ? "Los cambios no serán visibles públicamente."
              : "Esta ficha será visible públicamente."}
          </span>

        </div>


        <div className="admin-form-actions">

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() =>
              router.push(
                "/admin/residuos"
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
              : form.id
              ? "Guardar cambios"
              : "Crear borrador"}
          </button>

        </div>

      </div>

    </form>
  );
}