import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default async function FaqsPage() {
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select(`
      id,
      pregunta,
      respuesta,
      orden
    `)
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando FAQs:", error);
  }

  return (
    <main className="faq-page">
      <div className="faq-container">

        <Link href="/" className="back-link">
          ← Volver
        </Link>

        <header className="faq-header">
          <p className="eyebrow">
            RESUELVE TUS DUDAS
          </p>

          <h1>Preguntas frecuentes</h1>

          <p>
            Algunas dudas aplican a muchos residuos.
            Aquí encontrarás respuestas rápidas para
            manejar mejor tus materiales.
          </p>
        </header>

        <section className="faq-list">
          {faqs && faqs.length > 0 ? (
            faqs.map((faq) => (
              <details
                key={faq.id}
                className="faq-item"
              >
                <summary>
                  <span>{faq.pregunta}</span>
                  <span className="faq-plus">+</span>
                </summary>

                <div className="faq-answer">
                  <p>{faq.respuesta}</p>
                </div>
              </details>
            ))
          ) : (
            <p>
              Todavía no hay preguntas frecuentes
              disponibles.
            </p>
          )}
        </section>

        <section className="faq-help">
          <p className="eyebrow">
            ¿SIGUES CON LA DUDA?
          </p>

          <h2>
            Busca el residuo directamente
          </h2>

          <p>
            Cada objeto puede tener una forma diferente
            de preparación o disposición.
          </p>

          <Link href="/" className="faq-home-button">
            Buscar un residuo →
          </Link>
        </section>

      </div>
    </main>
  );
}