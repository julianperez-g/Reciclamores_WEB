import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import NoEncontreForm from "@/components/forms/NoEncontreForm";


type Props = {
  searchParams: Promise<{
    residuo?: string;
  }>;
};


export default async function NoEncontrePage({
  searchParams,
}: Props) {
  const params =
    await searchParams;


  const residuoInicial =
    typeof params.residuo === "string"
      ? params.residuo
      : "";


  return (
    <>

      <SiteHeader />


      <main className="not-found-page">

        <section className="not-found-hero">

          <div className="not-found-hero-number">
            01
          </div>


          <div className="not-found-hero-star">
            ✦
          </div>


          <div className="not-found-hero-loop">
            ∿
          </div>


          <div className="not-found-hero-copy">

            <Link
              href="/"
              className="not-found-back"
            >
              ← Volver al inicio
            </Link>


            <p className="not-found-eyebrow">
              NO LO ENCONTRASTE
            </p>


            <h1>
              Esa duda
              <span>
                también cuenta.
              </span>
            </h1>


            <p className="not-found-description">
              Cuéntanos qué residuo estabas
              buscando. Cada búsqueda nos ayuda
              a entender qué fichas debería
              crear Reciclamores después.
            </p>

          </div>


          <div className="not-found-hero-side">

            <span>
              TU BÚSQUEDA
            </span>


            <strong>
              ayuda a mejorar
              la guía
            </strong>


            <p>
              No necesitas registrarte ni
              entregar datos personales.
            </p>

          </div>

        </section>


        <section className="not-found-form-section">

          <div className="not-found-form-heading">

            <div className="not-found-section-number">
              02
            </div>


            <div>

              <p className="not-found-eyebrow">
                CUÉNTANOS
              </p>


              <h2>
                ¿Qué estabas
                buscando?
              </h2>

            </div>


            <p>
              Escribe el nombre como tú lo
              conoces. Puede ser una palabra,
              un apodo o una forma común de
              llamarlo.
            </p>

          </div>


          <div className="not-found-form-layout">

            <NoEncontreForm
              initialResiduo={
                residuoInicial
              }
            />


            <aside className="not-found-info">

              <div className="not-found-info-number">
                03
              </div>


              <p className="not-found-eyebrow">
                ¿QUÉ PASA DESPUÉS?
              </p>


              <h3>
                De una búsqueda
                puede salir una nueva ficha.
              </h3>


              <div className="not-found-steps">

                <div>

                  <span>
                    01
                  </span>

                  <p>
                    Tu búsqueda queda registrada.
                  </p>

                </div>


                <div>

                  <span>
                    02
                  </span>

                  <p>
                    Reciclamores identifica las
                    dudas que más se repiten.
                  </p>

                </div>


                <div>

                  <span>
                    03
                  </span>

                  <p>
                    Esas necesidades ayudan a
                    priorizar nuevo contenido.
                  </p>

                </div>

              </div>


              <div className="not-found-info-note">
                <span>
                  ✦
                </span>

                <p>
                  La guía crece a partir de
                  preguntas reales.
                </p>
              </div>

            </aside>

          </div>

        </section>


        <section className="not-found-explore">

          <div className="not-found-explore-number">
            04
          </div>


          <div>

            <p className="not-found-eyebrow">
              ANTES DE IRTE
            </p>


            <h2>
              Tal vez ya tenemos
              otra ficha que te sirva.
            </h2>

          </div>


          <div className="not-found-explore-actions">

            <Link
              href="/residuos"
              className="not-found-primary-link"
            >
              Explorar residuos

              <span>
                →
              </span>
            </Link>


            <Link
              href="/faqs"
              className="not-found-secondary-link"
            >
              Ver preguntas frecuentes
            </Link>

          </div>

        </section>

      </main>

    </>
  );
}