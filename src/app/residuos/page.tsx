import Link from "next/link";

import { supabase } from "@/lib/supabase/client";
import { getResiduoImageUrl } from "@/lib/supabase/storage";

import ResidueCatalog from "@/components/residuos/ResidueCatalog";

export default async function ResiduosPage() {
  const {
    data: residuos,
    error,
  } = await supabase
    .from("residuos")
    .select(`
      id,
      nombre,
      slug,
      imagen_path,
      imagen_alt,
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

  if (error) {
    console.error(
      "Error cargando catálogo de residuos:",
      error
    );
  }

  const catalogo =
    residuos?.map(
      (residuo) => ({
        id: residuo.id,

        nombre:
          residuo.nombre,

        slug:
          residuo.slug,

        imagenUrl:
          getResiduoImageUrl(
            residuo.imagen_path
          ),

        imagenAlt:
          residuo.imagen_alt ||
          residuo.nombre,

        aliases:
          residuo
            .residuo_aliases
            ?.map(
              (item: {
                alias: string;
              }) => item.alias
            ) ?? [],
      })
    ) ?? [];

  return (
    <main className="catalog-page">
      <div className="catalog-container">

        <Link
          href="/"
          className="back-link"
        >
          ← Volver
        </Link>

        <header className="catalog-header">
          <p className="eyebrow">
            EXPLORA LA GUÍA
          </p>

          <h1>
            Todos los residuos
          </h1>

          <p>
            Explora todas las fichas
            disponibles en la guía o busca
            un residuo por su nombre.
          </p>
        </header>

        <ResidueCatalog
          residuos={catalogo}
        />

      </div>
    </main>
  );
}