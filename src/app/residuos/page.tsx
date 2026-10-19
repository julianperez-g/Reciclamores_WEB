import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import ResidueCatalog from "@/components/residuos/ResidueCatalog";

import {
  supabase,
} from "@/lib/supabase/client";


type ResiduoCatalogo = {
  id: string;
  nombre: string;
  slug: string;

  duda_real:
    string | null;

  respuesta_corta:
    string | null;

  imagen_path:
    string | null;

  imagen_alt:
    string | null;
};


export default async function ResiduosPage() {
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
      imagen_path,
      imagen_alt
    `)
    .eq(
      "estado_publicacion",
      "publicado"
    )
    .eq(
      "nivel_certeza",
      "validado"
    )
    .order(
      "nombre",
      {
        ascending: true,
      }
    );


  if (error) {
    console.error(
      "Error cargando residuos:",
      error
    );
  }


  const residuos =
    (
      data ??
      []
    ) as ResiduoCatalogo[];


  return (
    <>

      <SiteHeader />


      <main className="catalog-page">

        <section className="catalog-hero">

          <div className="catalog-hero-number">
            01
          </div>


          <div className="catalog-hero-doodle catalog-hero-doodle-star">
            ✦
          </div>


          <div className="catalog-hero-doodle catalog-hero-doodle-line">
            ∿
          </div>


          <div className="catalog-hero-copy">

            <Link
              href="/"
              className="catalog-back-link"
            >
              ← Volver al inicio
            </Link>


            <p className="catalog-eyebrow">
              GUÍA DE RESIDUOS
            </p>


            <h1>
              Encuentra
              <span>
                ese residuo
              </span>
            </h1>


            <p className="catalog-hero-description">
              Busca por nombre y encuentra
              información clara sobre qué hacer,
              cómo manejarlo y qué ruta necesita.
            </p>

          </div>


          <div className="catalog-hero-count">

            <strong>
              {
                residuos.length
              }
            </strong>

            <span>
              fichas disponibles
            </span>

            <p>
              Contenido validado y publicado
              por Reciclamores.
            </p>

          </div>

        </section>


        <ResidueCatalog
          residuos={
            residuos
          }
        />


        <section className="catalog-help">

          <div className="catalog-help-number">
            03
          </div>


          <div>

            <p className="catalog-eyebrow">
              ¿NO APARECE?
            </p>

            <h2>
              Ayúdanos a ampliar
              la guía
            </h2>

            <p>
              Si buscaste un residuo y todavía
              no tenemos una ficha, cuéntanos.
              Esa búsqueda ayuda a Reciclamores
              a priorizar nuevo contenido.
            </p>

          </div>


          <Link
            href="/no-encontre"
            className="catalog-help-button"
          >
            No encontré mi residuo

            <span>
              →
            </span>
          </Link>

        </section>

      </main>

    </>
  );
}