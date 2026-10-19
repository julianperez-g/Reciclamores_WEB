import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import SiteHeader from "@/components/layout/SiteHeader";

import ShareActions from "@/components/residuos/ShareActions";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  getResiduoImageUrl,
} from "@/lib/supabase/storage";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};


type Residuo = {
  id: string;

  nombre: string;
  slug: string;

  duda_real:
    string | null;

  respuesta_corta:
    string | null;

  estado_general:
    string | null;

  va_reciclaje_convencional:
    string | null;

  reciclaje_convencional_detalle:
    string | null;

  se_entrega_reciclador:
    string | null;

  reciclador_detalle:
    string | null;

  como_preparar:
    string | null;

  nunca_hacer:
    string | null;

  tipo_ruta:
    string | null;

  indicacion_ruta:
    string | null;

  fuente_tecnica:
    string | null;

  fuente_url:
    string | null;

  fecha_verificacion:
    string | null;

  imagen_path:
    string | null;

  imagen_alt:
    string | null;

  imagen_credito:
    string | null;
};


function getEstadoLabel(
  value:
    string | null
) {
  switch (value) {
    case "ruta_especial":
      return "RUTA ESPECIAL";

    case "depende":
      return "DEPENDE";

    case "si":
      return "SÍ";

    case "no":
      return "NO";

    case "no_aplica":
      return "NO APLICA";

    case "parcialmente":
      return "PARCIALMENTE";

    default:
      return "REVISA LA GUÍA";
  }
}


function getEstadoClass(
  value:
    string | null
) {
  switch (value) {
    case "si":
      return "residue-answer-aqua";

    case "no":
      return "residue-answer-navy";

    case "ruta_especial":
      return "residue-answer-cobalt";

    case "depende":
    case "parcialmente":
      return "residue-answer-pastel";

    case "no_aplica":
      return "residue-answer-light";

    default:
      return "residue-answer-light";
  }
}


function getRutaLabel(
  value:
    string | null
) {
  switch (value) {
    case "salud":
      return "Servicio de salud";

    case "posconsumo":
      return "Programa posconsumo";

    case "raee":
      return "Ruta RAEE";

    case "gestor_autorizado":
      return "Gestor autorizado";

    case "local":
      return "Ruta local";

    case "ninguna":
      return "No requiere ruta especial";

    default:
      return "Ruta por confirmar";
  }
}


function formatFecha(
  value:
    string | null
) {
  if (!value) {
    return null;
  }


  const date =
    new Date(
      `${value}T12:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleDateString(
    "es-CO",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


export default async function ResiduoPage({
  params,
}: Props) {
  const {
    slug,
  } = await params;


  const {
    data,
    error,
  } = await supabase
    .from("residuos")
    .select(`
      id,
      nombre,
      slug,
      duda_real,
      respuesta_corta,
      estado_general,
      va_reciclaje_convencional,
      reciclaje_convencional_detalle,
      se_entrega_reciclador,
      reciclador_detalle,
      como_preparar,
      nunca_hacer,
      tipo_ruta,
      indicacion_ruta,
      fuente_tecnica,
      fuente_url,
      fecha_verificacion,
      imagen_path,
      imagen_alt,
      imagen_credito
    `)
    .eq(
      "slug",
      slug
    )
    .eq(
      "estado_publicacion",
      "publicado"
    )
    .eq(
      "nivel_certeza",
      "validado"
    )
    .single();


  if (
    error ||
    !data
  ) {
    notFound();
  }


  const residuo =
    data as Residuo;


  const imageUrl =
    getResiduoImageUrl(
      residuo.imagen_path
    );


  const fecha =
    formatFecha(
      residuo.fecha_verificacion
    );


  return (
    <>

      <SiteHeader />


      <main className="residue-page">

        <section className="residue-hero">

          <div className="residue-hero-number">
            01
          </div>


          <div className="residue-hero-star">
            ✦
          </div>


          <div className="residue-hero-copy">

            <Link
              href="/residuos"
              className="residue-back"
            >
              ← Todos los residuos
            </Link>


            <p className="residue-eyebrow">
              GUÍA DE RESIDUOS
            </p>


            <h1>
              {
                residuo.nombre
              }
            </h1>


            {residuo.duda_real && (
              <p className="residue-question">
                {
                  residuo.duda_real
                }
              </p>
            )}

          </div>


          <div
            className={
              `residue-main-answer ${getEstadoClass(
                residuo.estado_general
              )}`
            }
          >

            <span>
              ¿QUÉ HAGO CON ESTO?
            </span>


            <strong>
              {getEstadoLabel(
                residuo.estado_general
              )}
            </strong>


            {residuo.respuesta_corta && (
              <p>
                {
                  residuo.respuesta_corta
                }
              </p>
            )}

          </div>

        </section>


        <section className="residue-visual">

          <div className="residue-visual-number">
            02
          </div>


          <figure className="residue-image">

            {imageUrl ? (
              <img
                src={
                  imageUrl
                }
                alt={
                  residuo.imagen_alt ??
                  residuo.nombre
                }
              />
            ) : (
              <div className="residue-image-placeholder">
                ?
              </div>
            )}


            {residuo.imagen_credito && (
              <figcaption>
                {
                  residuo.imagen_credito
                }
              </figcaption>
            )}

          </figure>


          <div className="residue-visual-copy">

            <p className="residue-eyebrow">
              RESPUESTA RÁPIDA
            </p>


            <h2>
              Lo importante,
              <br />
              primero.
            </h2>


            <p>
              Revisa estas dos preguntas antes
              de decidir dónde poner este residuo.
            </p>


            <div className="residue-quick-arrow">
              ↓
            </div>

          </div>

        </section>


        <section className="residue-decisions">

          <article className="residue-decision-card">

            <div className="residue-card-number">
              03
            </div>


            <div className="residue-decision-heading">

              <span>
                RECICLAJE CONVENCIONAL
              </span>

              <h2>
                ¿Va al reciclaje
                convencional?
              </h2>

            </div>


            <div
              className={
                `residue-decision-result ${getEstadoClass(
                  residuo.va_reciclaje_convencional
                )}`
              }
            >
              {getEstadoLabel(
                residuo.va_reciclaje_convencional
              )}
            </div>


            {residuo.reciclaje_convencional_detalle && (
              <p>
                {
                  residuo.reciclaje_convencional_detalle
                }
              </p>
            )}

          </article>


          <article className="residue-decision-card residue-decision-card-alt">

            <div className="residue-card-number">
              04
            </div>


            <div className="residue-decision-heading">

              <span>
                RECICLADOR DE OFICIO
              </span>

              <h2>
                ¿Se lo puedo entregar
                a un reciclador?
              </h2>

            </div>


            <div
              className={
                `residue-decision-result ${getEstadoClass(
                  residuo.se_entrega_reciclador
                )}`
              }
            >
              {getEstadoLabel(
                residuo.se_entrega_reciclador
              )}
            </div>


            {residuo.reciclador_detalle && (
              <p>
                {
                  residuo.reciclador_detalle
                }
              </p>
            )}

          </article>

        </section>


        <section className="residue-handling">

          <div className="residue-handling-heading">

            <div className="residue-handling-number">
              05
            </div>


            <div>

              <p className="residue-eyebrow">
                ANTES DE ENTREGARLO
              </p>

              <h2>
                Cómo manejarlo
              </h2>

            </div>

          </div>


          <div className="residue-handling-grid">

            <article className="residue-handling-card">

              <div className="residue-handling-icon">
                ✓
              </div>


              <span>
                CÓMO PREPARARLO
              </span>


              <h3>
                Haz esto
              </h3>


              <p>
                {residuo.como_preparar ||
                  "No requiere una preparación especial indicada."}
              </p>

            </article>


            <article className="residue-handling-card residue-handling-card-dark">

              <div className="residue-handling-icon">
                ×
              </div>


              <span>
                EVITA ESTO
              </span>


              <h3>
                Nunca hacer
              </h3>


              <p>
                {residuo.nunca_hacer ||
                  "No hay una advertencia adicional registrada para esta ficha."}
              </p>

            </article>

          </div>

        </section>


        <section className="residue-route">

          <div className="residue-route-number">
            06
          </div>


          <div className="residue-route-heading">

            <p className="residue-eyebrow">
              RUTA
            </p>

            <h2>
              ¿Necesita una
              ruta especial?
            </h2>

          </div>


          <div className="residue-route-content">

            <span>
              TIPO DE RUTA
            </span>

            <strong>
              {getRutaLabel(
                residuo.tipo_ruta
              )}
            </strong>


            {residuo.indicacion_ruta && (
              <p>
                {
                  residuo.indicacion_ruta
                }
              </p>
            )}

          </div>


          <div className="residue-route-decoration">
            ∿
          </div>

        </section>


        <section className="residue-source">

          <div className="residue-source-number">
            07
          </div>


          <div className="residue-source-heading">

            <p className="residue-eyebrow">
              VERIFICACIÓN
            </p>

            <h2>
              Fuente técnica
            </h2>

          </div>


          <div className="residue-source-content">

            {residuo.fuente_tecnica && (
              <p>
                {
                  residuo.fuente_tecnica
                }
              </p>
            )}


            <div className="residue-source-meta">

              {fecha && (
                <span>
                  Revisado:
                  {" "}
                  {
                    fecha
                  }
                </span>
              )}


              {residuo.fuente_url && (
                <a
                  href={
                    residuo.fuente_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar fuente
                  <b>
                    ↗
                  </b>
                </a>
              )}

            </div>

          </div>

        </section>


        <section className="residue-share">

          <div>

            <p className="residue-eyebrow">
              COMPÁRTELO
            </p>

            <h2>
              Puede que alguien
              más tenga esta duda.
            </h2>

          </div>


          <ShareActions
            nombre={
              residuo.nombre
            }
          />

        </section>

      </main>

    </>
  );
}