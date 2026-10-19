"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  getResiduoImageUrl,
} from "@/lib/supabase/storage";


type Residuo = {
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


type Props = {
  residuos:
    Residuo[];
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
}: Props) {
  const [
    query,
    setQuery,
  ] =
    useState("");


  const resultados =
    useMemo(() => {
      const busqueda =
        normalizar(
          query
        );


      if (!busqueda) {
        return residuos;
      }


      return residuos.filter(
        (
          residuo
        ) => {
          const contenido =
            normalizar(
              [
                residuo.nombre,
                residuo.duda_real ??
                  "",
                residuo.respuesta_corta ??
                  "",
              ].join(
                " "
              )
            );


          return contenido.includes(
            busqueda
          );
        }
      );

    }, [
      query,
      residuos,
    ]);


  return (
    <section className="catalog-content">

      <div className="catalog-content-heading">

        <div className="catalog-content-number">
          02
        </div>


        <div>

          <p className="catalog-eyebrow">
            EXPLORA
          </p>

          <h2>
            Todos los
            <br />
            residuos
          </h2>

        </div>


        <p>
          Escribe el nombre de un objeto o
          recorre todas las fichas disponibles.
        </p>

      </div>


      <div className="catalog-search-area">

        <div className="catalog-search-box">

          <span>
            ⌕
          </span>


          <input
            type="text"
            value={
              query
            }
            onChange={(
              event
            ) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Buscar: aceite, pilas, ropa, bombillos..."
          />


          {query && (
            <button
              type="button"
              onClick={() =>
                setQuery("")
              }
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}

        </div>


        <div className="catalog-result-summary">

          <strong>
            {
              resultados.length
            }
          </strong>

          <span>
            {resultados.length === 1
              ? "ficha encontrada"
              : "fichas encontradas"}
          </span>

        </div>

      </div>


      {resultados.length > 0 ? (
        <div className="catalog-grid">

          {resultados.map(
            (
              residuo,
              index
            ) => {
              const imagenUrl =
                getResiduoImageUrl(
                  residuo.imagen_path
                );


              return (
                <Link
                  key={
                    residuo.id
                  }
                  href={
                    `/residuos/${residuo.slug}`
                  }
                  className="catalog-card"
                >

                  <div className="catalog-card-number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>


                  <div className="catalog-card-image">

                    {imagenUrl ? (
                      <img
                        src={
                          imagenUrl
                        }
                        alt={
                          residuo.imagen_alt ??
                          residuo.nombre
                        }
                      />
                    ) : (
                      <div className="catalog-card-no-image">
                        ?
                      </div>
                    )}

                  </div>


                  <div className="catalog-card-content">

                    <strong>
                      {
                        residuo.nombre
                      }
                    </strong>


                    {residuo.duda_real && (
                      <p>
                        {
                          residuo.duda_real
                        }
                      </p>
                    )}


                    <span>
                      Ver ficha
                      <b>
                        →
                      </b>
                    </span>

                  </div>

                </Link>
              );
            }
          )}

        </div>
      ) : (
        <div className="catalog-empty">

          <div className="catalog-empty-mark">
            ?
          </div>


          <div>

            <p className="catalog-eyebrow">
              SIN RESULTADOS
            </p>

            <h3>
              Todavía no tenemos
              esa ficha
            </h3>

            <p>
              Prueba otro término o cuéntanos
              qué residuo estabas buscando.
            </p>


            <Link
              href={
                `/no-encontre?residuo=${encodeURIComponent(
                  query
                )}`
              }
            >
              Registrar mi búsqueda
              <span>
                →
              </span>
            </Link>

          </div>

        </div>
      )}

    </section>
  );
}