import Link from "next/link";

import { supabase } from "@/lib/supabase/client";
import { getResiduoImageUrl } from "@/lib/supabase/storage";

import WasteSearch from "@/components/search/WasteSearch";

export default async function Home() {
  const {
    data: residuosDestacados,
    error: destacadosError,
  } = await supabase
    .from("residuos")
    .select(`
      id,
      nombre,
      slug,
      imagen_path,
      imagen_alt,
      destacado,
      orden_destacado
    `)
    .eq(
      "destacado",
      true
    )
    .eq(
      "estado_publicacion",
      "publicado"
    )
    .eq(
      "nivel_certeza",
      "validado"
    )
    .order(
      "orden_destacado",
      { ascending: true }
    );

  if (destacadosError) {
    console.error(
      "Error cargando residuos destacados:",
      destacadosError
    );
  }

  const {
    data: residuosBusqueda,
    error: busquedaError,
  } = await supabase
    .from("residuos")
    .select(`
      id,
      nombre,
      slug,
      residuo_aliases (
        alias
      )
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
      { ascending: true }
    );

  if (busquedaError) {
    console.error(
      "Error cargando residuos para búsqueda:",
      busquedaError
    );
  }

  const searchItems =
    residuosBusqueda?.map(
      (residuo) => ({
        id: residuo.id,

        nombre:
          residuo.nombre,

        slug:
          residuo.slug,

        aliases:
          residuo
            .residuo_aliases
            ?.map(
              (alias: {
                alias: string;
              }) =>
                alias.alias
            ) ?? [],
      })
    ) ?? [];

  const totalFichas =
    searchItems.length;

  return (
    <main className="home">

      <header className="header">
        <div className="brand">
          <span className="brand-name">
            Reciclamores
          </span>

          <span className="brand-ong">
            ONG
          </span>
        </div>
      </header>

      <section className="hero">

        <p className="eyebrow">
          GUÍA DIGITAL DE RESIDUOS
        </p>

        <h1>
          ¿Y ESTO DÓNDE VA?
        </h1>

        <p className="hero-description">
          Busca ese residuo que nunca
          sabes qué hacer con él.
        </p>

        <WasteSearch
          residuos={searchItems}
        />

      </section>

      <section className="section">

        <div className="section-heading">
          <div>
            <p className="eyebrow">
              EXPLORA
            </p>

            <h2>
              Los que más dudas generan
            </h2>
          </div>
        </div>

        <div className="waste-grid">

          {residuosDestacados?.map(
            (residuo) => {
              const imageUrl =
                getResiduoImageUrl(
                  residuo.imagen_path
                );

              return (
                <Link
                  href={`/residuos/${residuo.slug}`}
                  className="waste-card"
                  key={
                    residuo.id
                  }
                >
                  {imageUrl ? (
                    <img
                      src={
                        imageUrl
                      }
                      alt={
                        residuo.imagen_alt ||
                        residuo.nombre
                      }
                      className="waste-image"
                    />
                  ) : (
                    <div className="waste-image-placeholder" />
                  )}

                  <span>
                    {
                      residuo.nombre
                    }
                  </span>
                </Link>
              );
            }
          )}

        </div>

      </section>

      <section className="all-residues-section">

        <div className="all-residues-card">

          <div className="all-residues-copy">

            <p className="eyebrow">
              DESCUBRE MÁS
            </p>

            <h2>
              Explora todos los residuos
            </h2>

            <p>
              Consulta las{" "}
              <strong>
                {totalFichas}
              </strong>{" "}
              fichas disponibles
              actualmente en la guía.
            </p>

          </div>

          <Link
            href="/residuos"
            className="all-residues-button"
          >
            Ver todos los residuos
            <span>→</span>
          </Link>

        </div>

      </section>

      <section className="quick-links">

        <Link
          href="/faqs"
          className="info-card"
        >
          <div>

            <span className="info-label">
              APRENDE
            </span>

            <h3>
              Preguntas frecuentes
            </h3>

            <p>
              Resolvemos dudas que
              aplican a muchos residuos.
            </p>

          </div>

          <span className="arrow">
            →
          </span>
        </Link>

        <Link
          href="/no-encontre"
          className="info-card info-card-blue"
        >
          <div>

            <span className="info-label">
              ¿NO APARECE?
            </span>

            <h3>
              No encontré mi residuo
            </h3>

            <p>
              Cuéntanos qué estás
              buscando.
            </p>

          </div>

          <span className="arrow">
            →
          </span>
        </Link>

      </section>

      <footer className="footer">

        <strong>
          Reciclamores ONG
        </strong>

        <p>
          Acompañamos a los recicladores
          de oficio.
        </p>

        <p className="footer-image-note">
          Las imágenes de esta guía son
          ilustrativas y algunas pueden
          haber sido generadas
          digitalmente para facilitar la
          identificación de los residuos.
        </p>

      </footer>

    </main>
  );
}