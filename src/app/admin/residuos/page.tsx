"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

import {
  getCurrentAdmin,
} from "@/lib/admin/auth";

import {
  supabase,
} from "@/lib/supabase/client";


type ResiduoAdmin = {
  id: string;
  nombre: string;
  slug: string;
  estado_publicacion: string;
  nivel_certeza: string;
  destacado: boolean;
  imagen_path: string | null;
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


export default function AdminResiduosPage() {
  const router =
    useRouter();

  const [
    residuos,
    setResiduos,
  ] =
    useState<ResiduoAdmin[]>(
      []
    );

  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    filtro,
    setFiltro,
  ] =
    useState<
      "todos" |
      "publicados" |
      "borradores"
    >("todos");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  useEffect(() => {
    async function cargar() {
      const admin =
        await getCurrentAdmin();

      if (!admin) {
        router.replace(
          "/admin/login"
        );

        return;
      }

      const {
        data,
        error:
          residuosError,
      } = await supabase
        .from("residuos")
        .select(`
          id,
          nombre,
          slug,
          estado_publicacion,
          nivel_certeza,
          destacado,
          imagen_path
        `)
        .order(
          "nombre",
          {
            ascending: true,
          }
        );


      if (
        residuosError
      ) {
        console.error(
          residuosError
        );

        setError(
          "No fue posible cargar las fichas."
        );

        setLoading(false);

        return;
      }


      setResiduos(
        (
          data ??
          []
        ) as ResiduoAdmin[]
      );

      setLoading(false);
    }


    cargar();
  }, [router]);


  const resultados =
    useMemo(() => {
      const texto =
        normalizar(query);

      return residuos.filter(
        (
          residuo
        ) => {
          const coincideTexto =
            !texto ||
            normalizar(
              residuo.nombre
            ).includes(
              texto
            ) ||
            normalizar(
              residuo.slug
            ).includes(
              texto
            );

          const coincideFiltro =
            filtro === "todos"
              ? true
              : filtro ===
                  "publicados"
              ? residuo
                  .estado_publicacion ===
                "publicado"
              : residuo
                  .estado_publicacion ===
                "borrador";

          return (
            coincideTexto &&
            coincideFiltro
          );
        }
      );
    }, [
      residuos,
      query,
      filtro,
    ]);


  if (loading) {
    return (
      <main className="admin-loading-page">
        <div className="admin-loading-card">
          <span className="admin-loading-dot" />

          <p>
            Cargando residuos...
          </p>
        </div>
      </main>
    );
  }


  return (
    <main className="admin-page">
      <AdminSidebar />

      <section className="admin-main">

        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">
              CONTENIDO
            </p>

            <h1>
              Residuos
            </h1>
          </div>

          <Link
            href="/admin/residuos/nuevo"
            className="admin-primary-button"
          >
            + Nueva ficha
          </Link>
        </header>


        {error && (
          <div className="admin-page-error">
            {error}
          </div>
        )}


        <section className="admin-residues-toolbar">

          <div className="admin-needs-search">
            <span>
              ⌕
            </span>

            <input
              type="text"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Buscar fichas..."
            />

            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
              >
                ×
              </button>
            )}
          </div>


          <div className="admin-filter-tabs">
            <button
              type="button"
              className={
                filtro ===
                "todos"
                  ? "admin-filter-tab admin-filter-tab-active"
                  : "admin-filter-tab"
              }
              onClick={() =>
                setFiltro(
                  "todos"
                )
              }
            >
              Todos
            </button>

            <button
              type="button"
              className={
                filtro ===
                "publicados"
                  ? "admin-filter-tab admin-filter-tab-active"
                  : "admin-filter-tab"
              }
              onClick={() =>
                setFiltro(
                  "publicados"
                )
              }
            >
              Publicados
            </button>

            <button
              type="button"
              className={
                filtro ===
                "borradores"
                  ? "admin-filter-tab admin-filter-tab-active"
                  : "admin-filter-tab"
              }
              onClick={() =>
                setFiltro(
                  "borradores"
                )
              }
            >
              Borradores
            </button>
          </div>

        </section>


        <p className="admin-results-count">
          {
            resultados.length
          }{" "}
          fichas
        </p>


        <section className="admin-residues-list">

          {resultados.map(
            (
              residuo
            ) => (
              <article
                key={
                  residuo.id
                }
                className="admin-residue-row"
              >
                <div className="admin-residue-main">
                  <strong>
                    {
                      residuo.nombre
                    }
                  </strong>

                  <span>
                    /
                    {
                      residuo.slug
                    }
                  </span>
                </div>

                <div className="admin-residue-statuses">

                  <span
                    className={
                      residuo
                        .estado_publicacion ===
                      "publicado"
                        ? "admin-status admin-status-published"
                        : "admin-status admin-status-draft"
                    }
                  >
                    {
                      residuo
                        .estado_publicacion
                    }
                  </span>

                  <span
                    className={
                      residuo
                        .nivel_certeza ===
                      "validado"
                        ? "admin-status admin-status-validated"
                        : "admin-status admin-status-review"
                    }
                  >
                    {
                      residuo
                        .nivel_certeza
                    }
                  </span>

                  {residuo.destacado && (
                    <span className="admin-status">
                      Destacado
                    </span>
                  )}
                </div>

                <Link
                  href={`/admin/residuos/${residuo.id}/editar`}
                  className="admin-edit-button"
                >
                  Editar →
                </Link>
              </article>
            )
          )}

        </section>

      </section>
    </main>
  );
}