import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import WasteSearch from "@/components/search/WasteSearch";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  getResiduoImageUrl,
} from "@/lib/supabase/storage";


type ResiduoDestacado = {
  id: string;
  nombre: string;
  slug: string;

  duda_real:
    string | null;

  imagen_path:
    string | null;

  imagen_alt:
    string | null;

  orden_destacado:
    number | null;
};


type ResiduoBusqueda = {
  id: string;
  nombre: string;
  slug: string;

  residuo_aliases:
    {
      alias: string;
    }[] | null;
};


export default async function HomePage() {
  const {
    data:
      destacadosData,
  } = await supabase
    .from("residuos")
    .select(`
      id,
      nombre,
      slug,
      duda_real,
      imagen_path,
      imagen_alt,
      orden_destacado
    `)
    .eq(
      "destacado",
      true
    )
    .order(
      "orden_destacado",
      {
        ascending: true,
      }
    )
    .limit(
      6
    );


  const {
    data:
      busquedaData,
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
    .order(
      "nombre",
      {
        ascending: true,
      }
    );


  const destacados =
    (
      destacadosData ??
      []
    ) as ResiduoDestacado[];


  const residuosBusqueda =
    (
      busquedaData ??
      []
    ) as ResiduoBusqueda[];


  const searchItems =
    residuosBusqueda.map(
      (
        residuo
      ) => ({
        id:
          residuo.id,

        nombre:
          residuo.nombre,

        slug:
          residuo.slug,

        aliases:
          (
            residuo
              .residuo_aliases ??
            []
          ).map(
            (
              item
            ) =>
              item.alias
          ),
      })
    );


  return (
    <>

      <SiteHeader />


      <main className="home">

        <section className="home-hero">

          <div className="home-hero-number">
            01
          </div>


          <div className="home-doodle home-doodle-star">
            ✦
          </div>

          <div className="home-doodle home-doodle-loop">
            ∿
          </div>


          <div className="home-hero-content">

            <p className="home-eyebrow">
              GUÍA DIGITAL DE RESIDUOS
            </p>


            <h1>
              ¿Y ESTO
              <span>
                DÓNDE VA?
              </span>
            </h1>


            <p className="home-hero-copy">
              Ese residuo que tienes en la mano
              y nunca sabes qué hacer con él.
              Búscalo y te contamos qué hacer.
            </p>


            <div className="home-search-shell">

              <span className="home-search-label">
                BUSCA TU RESIDUO
              </span>


              <WasteSearch
                residuos={
                  searchItems
                }
              />

            </div>

          </div>


          <div className="home-hero-side">

            <div className="home-hero-side-card">

              <span>
                ¿ESPEJO?
              </span>

              <strong>
                ¿Va con el vidrio?
              </strong>

            </div>


            <div className="home-hero-side-card home-hero-side-card-aqua">

              <span>
                ¿JERINGA?
              </span>

              <strong>
                ¿Cómo la desecho?
              </strong>

            </div>


            <div className="home-hero-side-card">

              <span>
                ¿ICOPOR?
              </span>

              <strong>
                ¿Dónde va?
              </strong>

            </div>

          </div>

        </section>


        <section className="home-section home-featured-section">

          <div className="home-section-number">
            02
          </div>


          <div className="home-section-heading">

            <div>

              <p className="home-eyebrow">
                EXPLORA
              </p>

              <h2>
                Los que más
                <br />
                dudas generan
              </h2>

            </div>


            <p>
              Residuos que parecen fáciles,
              pero suelen terminar en el lugar
              equivocado.
            </p>

          </div>


          <div className="home-featured-grid">

            {destacados.map(
              (
                residuo,
                index
              ) => {
                const imageUrl =
                  getResiduoImageUrl(
                    residuo.imagen_path
                  );


                return (
                  <Link
                    href={
                      `/residuos/${residuo.slug}`
                    }
                    className="home-featured-card"
                    key={
                      residuo.id
                    }
                  >

                    <div className="home-featured-index">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>


                    <div className="home-featured-image">

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
                        <div className="home-featured-placeholder">
                          ?
                        </div>
                      )}

                    </div>


                    <div className="home-featured-content">

                      <strong>
                        {
                          residuo.nombre
                        }
                      </strong>


                      {residuo.duda_real && (
                        <span>
                          {
                            residuo.duda_real
                          }
                        </span>
                      )}


                      <div className="home-featured-link">

                        Ver ficha

                        <b>
                          →
                        </b>

                      </div>

                    </div>

                  </Link>
                );
              }
            )}

          </div>

        </section>


        <section className="home-explore-section">

          <div className="home-explore-number">
            03
          </div>


          <div className="home-explore-copy">

            <p className="home-eyebrow">
              GUÍA COMPLETA
            </p>

            <h2>
              Explora todos
              <br />
              los residuos
            </h2>

            <p>
              Consulta las fichas disponibles
              y encuentra información clara
              para manejar cada residuo.
            </p>

          </div>


          <div className="home-explore-action">

            <span>
              {
                residuosBusqueda.length
              }
            </span>

            <p>
              fichas disponibles
              actualmente
            </p>


            <Link
              href="/residuos"
              className="home-arrow-link"
            >
              Ver todos

              <b>
                →
              </b>
            </Link>

          </div>


          <div className="home-explore-scribble">
            ✧
          </div>

        </section>


        <section className="home-help-section">

          <div className="home-help-heading">

            <div className="home-section-number home-section-number-small">
              04
            </div>


            <div>

              <p className="home-eyebrow">
                ¿TIENES OTRA DUDA?
              </p>

              <h2>
                También podemos
                ayudarte por aquí
              </h2>

            </div>

          </div>


          <div className="home-help-grid">

            <Link
              href="/faqs"
              className="home-help-card"
            >

              <span className="home-help-icon">
                ?
              </span>


              <div>

                <small>
                  APRENDE
                </small>

                <strong>
                  Preguntas
                  frecuentes
                </strong>

                <p>
                  Respuestas rápidas para
                  dudas que se repiten.
                </p>

              </div>


              <b>
                →
              </b>

            </Link>


            <Link
              href="/no-encontre"
              className="home-help-card home-help-card-dark"
            >

              <span className="home-help-icon">
                +
              </span>


              <div>

                <small>
                  ¿NO APARECE?
                </small>

                <strong>
                  No encontré
                  mi residuo
                </strong>

                <p>
                  Cuéntanos qué estás
                  buscando.
                </p>

              </div>


              <b>
                →
              </b>

            </Link>

          </div>

        </section>


        <footer className="home-footer home-footer-compact">

          <div className="home-footer-mark">
            05
          </div>


          <div className="home-footer-scribble">
            ∿
          </div>


          <div className="home-footer-top">

            <div className="home-footer-brand-block">

              <div className="home-footer-brand">

                <strong>
                  Reciclamores
                </strong>

                <span>
                  ONG
                </span>

              </div>


              <p>
                Acompañamos a los recicladores
                de oficio y promovemos una
                economía circular con impacto
                social.
              </p>

            </div>


            <div className="home-footer-connect">

              <p className="home-footer-connect-title">
                Conecta con nosotros
              </p>


              <div className="home-footer-links">

                <a
                  href="mailto:contacto@reciclamores.org"
                >
                  <span>
                    contacto@reciclamores.org
                  </span>

                  <span>
                    ↗
                  </span>
                </a>


                <a
                  href="https://www.instagram.com/reciclamores.ong/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    @reciclamores.ong
                  </span>

                  <span>
                    ↗
                  </span>
                </a>


                <a
                  href="https://reciclamores.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    Sitio de Reciclamores
                  </span>

                  <span>
                    ↗
                  </span>
                </a>


                <Link
                  href="/faqs"
                >
                  <span>
                    Preguntas frecuentes
                  </span>

                  <span>
                    →
                  </span>
                </Link>

              </div>

            </div>

          </div>


          <div className="home-footer-bottom">

            <div className="home-footer-bottom-left">

              <span>
                Guía digital de residuos
              </span>

              <span className="home-footer-dot" />

              <span>
                Reciclamores ONG
              </span>

            </div>


            <div className="home-footer-bottom-right">

              <span>
                Bogotá · Colombia
              </span>

              <span className="home-footer-dot" />

              <span>
                2026
              </span>

            </div>

          </div>

        </footer>

      </main>

    </>
  );
}