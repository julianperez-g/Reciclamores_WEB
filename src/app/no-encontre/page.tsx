import Link from "next/link";
import NoEncontreForm from "@/components/forms/NoEncontreForm";

type NoEncontrePageProps = {
  searchParams: Promise<{
    residuo?: string;
  }>;
};

export default async function NoEncontrePage({
  searchParams,
}: NoEncontrePageProps) {
  const params = await searchParams;

  const residuoInicial =
    typeof params.residuo === "string"
      ? params.residuo
      : "";

  return (
    <main className="not-found-page">
      <div className="not-found-container">
        <Link href="/" className="back-link">
          ← Volver
        </Link>

        <header className="not-found-header">
          <p className="eyebrow">
            AYÚDANOS A MEJORAR
          </p>

          <h1>
            ¿No encontraste tu residuo?
          </h1>

          <p>
            Escríbenos qué estabas buscando. Así
            Reciclamores puede identificar las dudas más
            frecuentes y priorizar nuevas fichas.
          </p>
        </header>

        <NoEncontreForm
          residuoInicial={residuoInicial}
        />

        <section className="not-found-privacy">
          <strong>
            No necesitamos tus datos personales.
          </strong>

          <p>
            Solo registramos el nombre del residuo que
            buscaste para mejorar el contenido de la guía.
          </p>
        </section>
      </div>
    </main>
  );
}