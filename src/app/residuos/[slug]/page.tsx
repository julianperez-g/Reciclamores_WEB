import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase/client";
import { getResiduoImageUrl } from "@/lib/supabase/storage";

import ShareActions from "@/components/residuos/ShareActions";

type ResiduoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ResiduoPage({
  params,
}: ResiduoPageProps) {
  const { slug } = await params;

  const {
    data: residuo,
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
      imagen_tipo,
      imagen_credito
    `)
    .eq("slug", slug)
    .single();

  if (error || !residuo) {
    notFound();
  }

  const imageUrl =
    getResiduoImageUrl(
      residuo.imagen_path
    );

  const estadoGeneral =
    residuo.estado_general
      .replaceAll("_", " ")
      .toUpperCase();

  const estadoReciclaje =
    residuo.va_reciclaje_convencional
      .replaceAll("_", " ")
      .toUpperCase();

  const estadoReciclador =
    residuo.se_entrega_reciclador
      .replaceAll("_", " ")
      .toUpperCase();

  const tipoRuta =
    residuo.tipo_ruta
      .replaceAll("_", " ")
      .toUpperCase();

  return (
    <main className="residue-page">
      <div className="residue-container">
        <Link
          href="/"
          className="back-link"
        >
          ← Volver
        </Link>

        <header className="residue-header">
          <p className="eyebrow">
            GUÍA DE RESIDUOS
          </p>

          <h1>
            {residuo.nombre}
          </h1>

          <p className="residue-question">
            {residuo.duda_real}
          </p>
        </header>

        {imageUrl && (
          <figure
            style={{
              margin: "0 0 28px",
            }}
          >
            <div
              style={{
                overflow: "hidden",
                borderRadius: "24px",
                background: "#dff5fa",
              }}
            >
              <img
                src={imageUrl}
                alt={
                  residuo.imagen_alt ||
                  residuo.nombre
                }
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                }}
              />
            </div>

            {residuo.imagen_credito && (
              <figcaption
                style={{
                  marginTop: "8px",
                  color: "#647786",
                  fontSize: "12px",
                }}
              >
                Imagen:{" "}
                {residuo.imagen_credito}
              </figcaption>
            )}
          </figure>
        )}

        <section className="answer-main">
          <span className="answer-status">
            {estadoGeneral}
          </span>

          <h2>
            ¿Qué hago con esto?
          </h2>

          <p>
            {residuo.respuesta_corta}
          </p>
        </section>

        <section className="residue-block">
          <h2>
            ¿Va al reciclaje convencional?
          </h2>

          <strong>
            {estadoReciclaje}
          </strong>

          {residuo
            .reciclaje_convencional_detalle && (
            <p>
              {
                residuo
                  .reciclaje_convencional_detalle
              }
            </p>
          )}
        </section>

        <section className="residue-block">
          <h2>
            ¿Se lo puedo entregar a un
            reciclador de oficio?
          </h2>

          <strong>
            {estadoReciclador}
          </strong>

          {residuo.reciclador_detalle && (
            <p>
              {
                residuo.reciclador_detalle
              }
            </p>
          )}
        </section>

        <section className="residue-block">
          <h2>
            ¿Cómo lo preparo o almaceno?
          </h2>

          <p>
            {residuo.como_preparar}
          </p>
        </section>

        <section className="residue-block warning-block">
          <h2>
            ¿Qué nunca debo hacer?
          </h2>

          <p>
            {residuo.nunca_hacer}
          </p>
        </section>

        {residuo.tipo_ruta !==
          "ninguna" && (
          <section className="residue-block route-block">
            <p className="eyebrow">
              RUTA ESPECIAL
            </p>

            <h2>
              {tipoRuta}
            </h2>

            {residuo.indicacion_ruta && (
              <p>
                {
                  residuo.indicacion_ruta
                }
              </p>
            )}
          </section>
        )}

        <section className="source-block">
          <p>
            <strong>
              Información verificada por
              Reciclamores
            </strong>
          </p>

          <p>
            Última revisión:{" "}
            {
              residuo.fecha_verificacion
            }
          </p>

          {residuo.fuente_url && (
            <p>
              <a
                href={
                  residuo.fuente_url
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver fuente técnica →
              </a>
            </p>
          )}
        </section>

        <ShareActions
          nombre={residuo.nombre}
        />
      </div>
    </main>
  );
}