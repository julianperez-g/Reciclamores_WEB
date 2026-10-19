import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  supabase,
} from "@/lib/supabase/client";


type Faq = {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
};


export default async function FaqsPage() {
  const {
    data,
    error,
  } = await supabase
    .from("faqs")
    .select(`
      id,
      pregunta,
      respuesta,
      orden
    `)
    .eq(
      "activa",
      true
    )
    .order(
      "orden",
      {
        ascending: true,
      }
    );


  if (error) {
    console.error(
      "Error cargando FAQs:",
      error
    );
  }


  const faqs =
    (
      data ??
      []
    ) as Faq[];


  return (
    <>

      <SiteHeader />


      <main className="faq-page">

        <section className="faq-hero">

          <div className="faq-hero-number">
            01
          </div>


          <div className="faq-hero-star">
            ✦
          </div>


          <div className="faq-hero-loop">
            ∿
          </div>


          <div className="faq-hero-copy">

            <Link
              href="/"
              className="faq-back-link"
            >
              ← Volver al inicio
            </Link>


            <p className="faq-eyebrow">
              PREGUNTAS FRECUENTES
            </p>


            <h1>
              Dudas que
              <span>
                se repiten
              </span>
            </h1>


            <p className="faq-hero-description">
              Respuestas rápidas para esas
              preguntas que aparecen una y otra
              vez cuando hablamos de residuos.
            </p>

          </div>


          <div className="faq-hero-count">

            <strong>
              {
                faqs.length
              }
            </strong>

            <span>
              respuestas disponibles
            </span>

            <p>
              Información preparada para
              resolver dudas comunes de forma
              sencilla.
            </p>

          </div>

        </section>


        <section className="faq-content">

          <div className="faq-content-heading">

            <div className="faq-content-number">
              02
            </div>


            <div>

              <p className="faq-eyebrow">
                ABRE LA QUE NECESITES
              </p>


              <h2>
                Pregunta.
                <br />
                Respuesta.
              </h2>

            </div>


            <p>
              No necesitas leer todo.
              Abre únicamente la pregunta que
              tengas en este momento.
            </p>

          </div>


          <div className="faq-list">

            {faqs.map(
              (
                faq,
                index
              ) => (
                <details
                  key={
                    faq.id
                  }
                  className="faq-item"
                >

                  <summary className="faq-question">

                    <span className="faq-item-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>


                    <strong>
                      {
                        faq.pregunta
                      }
                    </strong>


                    <span className="faq-toggle">
                      +
                    </span>

                  </summary>


                  <div className="faq-answer">

                    <div className="faq-answer-line" />


                    <p>
                      {
                        faq.respuesta
                      }
                    </p>

                  </div>

                </details>
              )
            )}

          </div>

        </section>


        <section className="faq-help">

          <div className="faq-help-number">
            03
          </div>


          <div className="faq-help-copy">

            <p className="faq-eyebrow">
              ¿SIGUES CON LA DUDA?
            </p>


            <h2>
              Tal vez estás buscando
              un residuo específico.
            </h2>


            <p>
              Puedes explorar todas las fichas
              disponibles o registrar el residuo
              que todavía no aparece en la guía.
            </p>

          </div>


          <div className="faq-help-actions">

            <Link
              href="/residuos"
              className="faq-help-primary"
            >
              Ver residuos

              <span>
                →
              </span>
            </Link>


            <Link
              href="/no-encontre"
              className="faq-help-secondary"
            >
              No encontré mi residuo
            </Link>

          </div>

        </section>

      </main>

    </>
  );
}