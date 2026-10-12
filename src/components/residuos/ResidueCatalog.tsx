"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ResiduoCatalogo = {
  id: string;
  nombre: string;
  slug: string;

  imagenUrl:
    | string
    | null;

  imagenAlt: string;

  aliases: string[];
};

type ResidueCatalogProps = {
  residuos: ResiduoCatalogo[];
};

function normalizar(
  texto: string
) {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}

export default function ResidueCatalog({
  residuos,
}: ResidueCatalogProps) {
  const [query, setQuery] =
    useState("");

  const resultados =
    useMemo(() => {
      const texto =
        normalizar(query);

      if (!texto) {
        return residuos;
      }

      return residuos.filter(
        (residuo) => {
          const nombre =
            normalizar(
              residuo.nombre
            );

          const coincideNombre =
            nombre.includes(
              texto
            );

          const coincideAlias =
            residuo.aliases.some(
              (alias) =>
                normalizar(
                  alias
                ).includes(
                  texto
                )
            );

          return (
            coincideNombre ||
            coincideAlias
          );
        }
      );
    }, [
      query,
      residuos,
    ]);

  return (
    <>
      <div className="catalog-search">
        <span className="catalog-search-icon">
          ⌕
        </span>

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Buscar en todos los residuos..."
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            className="catalog-clear"
            onClick={() =>
              setQuery("")
            }
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      <div className="catalog-meta">
        {query ? (
          <span>
            {
              resultados.length
            }{" "}
            resultado
            {
              resultados.length !==
              1
                ? "s"
                : ""
            }
          </span>
        ) : (
          <span>
            {
              residuos.length
            }{" "}
            fichas disponibles
          </span>
        )}
      </div>

      {resultados.length > 0 ? (
        <div className="catalog-grid">
          {resultados.map(
            (residuo) => (
              <Link
                key={
                  residuo.id
                }
                href={`/residuos/${residuo.slug}`}
                className="catalog-card"
              >
                {residuo.imagenUrl ? (
                  <img
                    src={
                      residuo.imagenUrl
                    }
                    alt={
                      residuo.imagenAlt
                    }
                    className="catalog-card-image"
                  />
                ) : (
                  <div className="catalog-card-placeholder">
                    <span>
                      Imagen
                      próximamente
                    </span>
                  </div>
                )}

                <div className="catalog-card-content">
                  <h2>
                    {
                      residuo.nombre
                    }
                  </h2>

                  <span>
                    Ver ficha →
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
      ) : (
        <section className="catalog-empty">
          <p className="eyebrow">
            SIN RESULTADOS
          </p>

          <h2>
            No encontramos “
            {query}”
          </h2>

          <p>
            Si no encuentras el
            residuo que necesitas,
            puedes contárselo a
            Reciclamores.
          </p>

          <Link
            href={`/no-encontre?residuo=${encodeURIComponent(
              query
            )}`}
            className="catalog-empty-button"
          >
            No encontré mi
            residuo →
          </Link>
        </section>
      )}
    </>
  );
}