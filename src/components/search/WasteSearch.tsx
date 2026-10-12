"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { supabase } from "@/lib/supabase/client";

type SearchItem = {
  id: string;
  nombre: string;
  slug: string;
  aliases: string[];
};

type WasteSearchProps = {
  residuos: SearchItem[];
};

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function WasteSearch({
  residuos,
}: WasteSearchProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [navegando, setNavegando] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(residuos, {
        keys: [
          {
            name: "nombre",
            weight: 0.6,
          },
          {
            name: "aliases",
            weight: 0.4,
          },
        ],

        threshold: 0.25,
        ignoreLocation: true,
        minMatchCharLength: 2,
        shouldSort: true,
      }),
    [residuos]
  );

  const resultados = useMemo(() => {
    const texto = query.trim().toLowerCase();

    if (texto.length < 2) {
      return [];
    }

    // Para búsquedas cortas usamos coincidencia directa.
    // Así evitamos resultados extraños del fuzzy search.
    if (texto.length <= 3) {
      return residuos
        .filter((residuo) => {
          const nombre =
            residuo.nombre.toLowerCase();

          const coincideNombre =
            nombre.includes(texto);

          const coincideAlias =
            residuo.aliases.some((alias) =>
              alias
                .toLowerCase()
                .includes(texto)
            );

          return (
            coincideNombre ||
            coincideAlias
          );
        })
        .slice(0, 3);
    }

    // Desde 4 caracteres permitimos errores
    // ortográficos usando Fuse.js.
    return fuse
      .search(texto)
      .slice(0, 3)
      .map(
        (resultado) =>
          resultado.item
      );
  }, [query, fuse, residuos]);

  async function registrarBusquedaExitosa(
    residuo: SearchItem,
    textoBuscado: string
  ) {
    const texto = textoBuscado.trim();

    if (texto.length < 2) {
      return;
    }

    const { error } = await supabase
      .from("busquedas")
      .insert({
        texto_original: texto,
        texto_normalizado:
          normalizarTexto(texto),

        encontro_resultado: true,

        residuo_id: residuo.id,

        origen: "buscador",
      });

    if (error) {
      // No bloqueamos al usuario si analytics falla.
      console.error(
        "Error registrando búsqueda exitosa:",
        error
      );
    }
  }

  async function irAResiduo(
    residuo: SearchItem
  ) {
    if (navegando) {
      return;
    }

    setNavegando(true);

    const textoBuscado = query;

    await registrarBusquedaExitosa(
      residuo,
      textoBuscado
    );

    setQuery("");

    router.push(
      `/residuos/${residuo.slug}`
    );
  }

  async function manejarSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (resultados.length === 0) {
      return;
    }

    await irAResiduo(
      resultados[0]
    );
  }

  function irANoEncontrado() {
    const texto = query.trim();

    router.push(
      `/no-encontre?residuo=${encodeURIComponent(
        texto
      )}`
    );
  }

  return (
    <div className="waste-search-wrapper">
      <form
        className="search-box"
        onSubmit={manejarSubmit}
      >
        <span className="search-icon">
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
          placeholder="Espejo, jeringa, radiografía, icopor..."
          autoComplete="off"
          disabled={navegando}
        />
      </form>

      {query.trim().length >= 2 && (
        <div className="search-results">
          {resultados.length > 0 ? (
            resultados.map(
              (residuo) => (
                <button
                  key={residuo.id}
                  type="button"
                  className="search-result"
                  disabled={navegando}
                  onClick={() =>
                    irAResiduo(
                      residuo
                    )
                  }
                >
                  <div className="search-result-content">
                    <strong>
                      {
                        residuo.nombre
                      }
                    </strong>

                    {residuo
                      .aliases
                      .length >
                      0 && (
                      <small>
                        También:{" "}
                        {residuo.aliases
                          .slice(
                            0,
                            3
                          )
                          .join(", ")}
                      </small>
                    )}
                  </div>

                  <span className="search-result-arrow">
                    →
                  </span>
                </button>
              )
            )
          ) : (
            <div className="search-empty">
              <strong>
                No encontramos “
                {query}”
              </strong>

              <p>
                Puedes contarnos qué
                residuo estás buscando.
              </p>

              <button
                type="button"
                onClick={
                  irANoEncontrado
                }
              >
                No encontré mi
                residuo →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}