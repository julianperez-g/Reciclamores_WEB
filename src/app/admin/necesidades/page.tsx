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

import type {
  AdminProfile,
} from "@/lib/admin/auth";

import {
  supabase,
} from "@/lib/supabase/client";


type Necesidad = {
  texto_normalizado: string;
  texto_muestra: string;
  total_busquedas: number;
  primera_busqueda: string;
  ultima_busqueda: string;

  residuo_relacionado_id:
    string | null;

  residuo_relacionado_nombre:
    string | null;

  residuo_estado_publicacion:
    string | null;
};


type NecesidadRpcRow = {
  texto_normalizado:
    string | null;

  texto_muestra:
    string | null;

  total_busquedas:
    number | string | null;

  primera_busqueda:
    string | null;

  ultima_busqueda:
    string | null;

  residuo_relacionado_id:
    string | null;

  residuo_relacionado_nombre:
    string | null;

  residuo_estado_publicacion:
    string | null;
};


function formatearFecha(
  fecha: string
) {
  return new Intl.DateTimeFormat(
    "es-CO",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(fecha)
  );
}


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


export default function NecesidadesPage() {
  const router =
    useRouter();


  const [
    admin,
    setAdmin,
  ] =
    useState<AdminProfile | null>(
      null
    );


  const [
    necesidades,
    setNecesidades,
  ] =
    useState<Necesidad[]>(
      []
    );


  const [
    query,
    setQuery,
  ] =
    useState("");


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
    async function cargarNecesidades() {
      setLoading(true);
      setError(null);


      const adminActual =
        await getCurrentAdmin();


      if (!adminActual) {
        await supabase.auth.signOut();

        router.replace(
          "/admin/login"
        );

        return;
      }


      setAdmin(
        adminActual
      );


      const {
        data,
        error:
          necesidadesError,
      } = await supabase.rpc(
        "get_necesidades_admin_v2",
        {
          p_limite: 500,
        }
      );


      if (
        necesidadesError
      ) {
        console.error(
          necesidadesError
        );

        setError(
          "No fue posible cargar las necesidades detectadas."
        );

        setLoading(false);

        return;
      }


      const rows =
        (
          data ??
          []
        ) as NecesidadRpcRow[];


      setNecesidades(
        rows.map(
          (
            item:
              NecesidadRpcRow
          ) => ({
            texto_normalizado:
              String(
                item
                  .texto_normalizado ??
                  ""
              ),

            texto_muestra:
              String(
                item
                  .texto_muestra ??
                  item
                    .texto_normalizado ??
                  ""
              ),

            total_busquedas:
              Number(
                item
                  .total_busquedas
              ) || 0,

            primera_busqueda:
              String(
                item
                  .primera_busqueda ??
                  ""
              ),

            ultima_busqueda:
              String(
                item
                  .ultima_busqueda ??
                  ""
              ),

            residuo_relacionado_id:
              item
                .residuo_relacionado_id ??
              null,

            residuo_relacionado_nombre:
              item
                .residuo_relacionado_nombre ??
              null,

            residuo_estado_publicacion:
              item
                .residuo_estado_publicacion ??
              null,
          })
        )
      );


      setLoading(false);
    }


    cargarNecesidades();
  }, [router]);


  const resultados =
    useMemo(() => {
      const texto =
        normalizar(
          query
        );


      if (!texto) {
        return necesidades;
      }


      return necesidades.filter(
        (
          necesidad
        ) =>
          normalizar(
            necesidad.texto_muestra
          ).includes(
            texto
          ) ||
          normalizar(
            necesidad.texto_normalizado
          ).includes(
            texto
          )
      );
    }, [
      necesidades,
      query,
    ]);


  const totalBusquedasFallidas =
    necesidades.reduce(
      (
        acumulado,
        necesidad
      ) =>
        acumulado +
        necesidad.total_busquedas,
      0
    );


  if (loading) {
    return (
      <main className="admin-loading-page">
        <div className="admin-loading-card">
          <span className="admin-loading-dot" />

          <p>
            Cargando necesidades...
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
              INTELIGENCIA DE DEMANDA
            </p>

            <h1>
              Necesidades
            </h1>
          </div>


          <div className="admin-user">
            <span>
              Sesión iniciada
            </span>

            <strong>
              {admin?.nombre ||
                "Administrador"}
            </strong>
          </div>
        </header>


        {error && (
          <div className="admin-page-error">
            {error}
          </div>
        )}


        <section className="admin-needs-summary">

          <div>
            <span>
              TÉRMINOS PENDIENTES
            </span>

            <strong>
              {
                necesidades.length
              }
            </strong>
          </div>


          <div>
            <span>
              BÚSQUEDAS FALLIDAS
            </span>

            <strong>
              {
                totalBusquedasFallidas
              }
            </strong>
          </div>


          <div className="admin-needs-summary-copy">
            <strong>
              Backlog basado en demanda real
            </strong>

            <p>
              Crear una ficha no elimina la
              necesidad inmediatamente. Se
              considera resuelta cuando la
              ficha queda validada y publicada.
            </p>
          </div>

        </section>


        <section className="admin-needs-section">

          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">
                PRIORIDAD
              </p>

              <h2>
                Residuos no encontrados
              </h2>

              <p>
                Los resultados están ordenados
                desde los términos con mayor
                demanda.
              </p>
            </div>
          </div>


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
              placeholder="Buscar dentro de las necesidades..."
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


          <div className="admin-needs-results-meta">
            {
              resultados.length
            }{" "}
            {resultados.length === 1
              ? "necesidad"
              : "necesidades"}
          </div>


          {resultados.length > 0 ? (
            <div className="admin-needs-table">

              <div className="admin-needs-table-header">
                <span>
                  Término
                </span>

                <span>
                  Búsquedas
                </span>

                <span>
                  Primera
                </span>

                <span>
                  Última
                </span>

                <span>
                  Acción
                </span>
              </div>


              {resultados.map(
                (
                  necesidad
                ) => (
                  <article
                    className="admin-needs-table-row"
                    key={
                      necesidad
                        .texto_normalizado
                    }
                  >

                    <div className="admin-needs-term">
                      <strong>
                        {
                          necesidad
                            .texto_muestra
                        }
                      </strong>

                      <span>
                        {
                          necesidad
                            .texto_normalizado
                        }
                      </span>
                    </div>


                    <div className="admin-needs-number">
                      <strong>
                        {
                          necesidad
                            .total_busquedas
                        }
                      </strong>
                    </div>


                    <span className="admin-needs-date">
                      {formatearFecha(
                        necesidad
                          .primera_busqueda
                      )}
                    </span>


                    <span className="admin-needs-date">
                      {formatearFecha(
                        necesidad
                          .ultima_busqueda
                      )}
                    </span>


                    <div className="admin-need-action">

                      {necesidad
                        .residuo_relacionado_id ? (

                        <Link
                          href={
                            `/admin/residuos/${
                              necesidad
                                .residuo_relacionado_id
                            }/editar`
                          }
                          className="admin-need-linked-button"
                        >
                          <span>
                            Borrador creado
                          </span>

                          <strong>
                            Editar →
                          </strong>
                        </Link>

                      ) : (

                        <Link
                          href={
                            `/admin/residuos/nuevo?nombre=${
                              encodeURIComponent(
                                necesidad
                                  .texto_muestra
                              )
                            }&necesidad=${
                              encodeURIComponent(
                                necesidad
                                  .texto_normalizado
                              )
                            }`
                          }
                          className="admin-need-create-button"
                        >
                          Crear ficha →
                        </Link>

                      )}

                    </div>

                  </article>
                )
              )}

            </div>
          ) : (
            <div className="admin-empty-state">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  No hay necesidades pendientes
                </strong>

                <p>
                  Todas las necesidades
                  detectadas ya fueron
                  gestionadas.
                </p>
              </div>
            </div>
          )}

        </section>

      </section>
    </main>
  );
}