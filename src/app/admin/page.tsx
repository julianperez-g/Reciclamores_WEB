"use client";

import Link from "next/link";

import {
  useEffect,
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


type DashboardStats = {
  fichas_publicadas: number;
  fichas_borrador: number;
  busquedas_totales: number;
  necesidades_pendientes: number;
};


type DashboardStatsRpcRow = {
  fichas_publicadas:
    number | string | null;

  fichas_borrador:
    number | string | null;

  busquedas_totales:
    number | string | null;

  necesidades_pendientes:
    number | string | null;
};


type Necesidad = {
  texto_normalizado: string;
  texto_muestra: string;
  total_busquedas: number;
  primera_busqueda: string;
  ultima_busqueda: string;
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


export default function AdminPage() {
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
    stats,
    setStats,
  ] =
    useState<DashboardStats>({
      fichas_publicadas: 0,
      fichas_borrador: 0,
      busquedas_totales: 0,
      necesidades_pendientes: 0,
    });

  const [
    necesidades,
    setNecesidades,
  ] =
    useState<Necesidad[]>(
      []
    );

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
    async function cargarDashboard() {
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


      const [
        statsResponse,
        necesidadesResponse,
      ] =
        await Promise.all([
          supabase.rpc(
            "get_admin_dashboard_stats"
          ),

          supabase.rpc(
            "get_necesidades_admin",
            {
              p_limite: 5,
            }
          ),
        ]);


      if (
        statsResponse.error
      ) {
        console.error(
          "Error cargando estadísticas:",
          statsResponse.error
        );

        setError(
          "No fue posible cargar las estadísticas del dashboard."
        );

        setLoading(false);

        return;
      }


      if (
        necesidadesResponse.error
      ) {
        console.error(
          "Error cargando necesidades:",
          necesidadesResponse.error
        );

        setError(
          "No fue posible cargar las necesidades detectadas."
        );

        setLoading(false);

        return;
      }


      const statsRows =
        (
          statsResponse.data ??
          []
        ) as DashboardStatsRpcRow[];


      const statsData =
        statsRows[0];


      if (statsData) {
        setStats({
          fichas_publicadas:
            Number(
              statsData
                .fichas_publicadas
            ) || 0,

          fichas_borrador:
            Number(
              statsData
                .fichas_borrador
            ) || 0,

          busquedas_totales:
            Number(
              statsData
                .busquedas_totales
            ) || 0,

          necesidades_pendientes:
            Number(
              statsData
                .necesidades_pendientes
            ) || 0,
        });
      }


      const necesidadRows =
        (
          necesidadesResponse.data ??
          []
        ) as NecesidadRpcRow[];


      setNecesidades(
        necesidadRows.map(
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
          })
        )
      );


      setLoading(false);
    }


    cargarDashboard();
  }, [router]);


  if (loading) {
    return (
      <main className="admin-loading-page">
        <div className="admin-loading-card">
          <span className="admin-loading-dot" />

          <p>
            Cargando dashboard...
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
              PANEL ADMINISTRATIVO
            </p>

            <h1>
              Dashboard
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


        <section className="admin-metrics">

          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span>
                PUBLICADAS
              </span>

              <span className="admin-metric-dot admin-metric-dot-green" />
            </div>

            <strong>
              {
                stats.fichas_publicadas
              }
            </strong>

            <p>
              fichas visibles en la guía
            </p>
          </article>


          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span>
                BORRADORES
              </span>

              <span className="admin-metric-dot admin-metric-dot-yellow" />
            </div>

            <strong>
              {
                stats.fichas_borrador
              }
            </strong>

            <p>
              fichas aún no publicadas
            </p>
          </article>


          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span>
                BÚSQUEDAS
              </span>

              <span className="admin-metric-dot" />
            </div>

            <strong>
              {
                stats.busquedas_totales
              }
            </strong>

            <p>
              búsquedas registradas
            </p>
          </article>


          <article className="admin-metric-card admin-metric-card-highlight">
            <div className="admin-metric-top">
              <span>
                NECESIDADES
              </span>

              <span className="admin-metric-dot admin-metric-dot-red" />
            </div>

            <strong>
              {
                stats.necesidades_pendientes
              }
            </strong>

            <p>
              residuos distintos pendientes
            </p>
          </article>

        </section>


        <section className="admin-needs-preview">

          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">
                DEMANDA DE USUARIOS
              </p>

              <h2>
                Lo que están buscando
                y no encuentran
              </h2>

              <p>
                Estos términos pueden ayudar
                a decidir cuáles deberían ser
                las próximas fichas de la guía.
              </p>
            </div>

            <Link
              href="/admin/necesidades"
              className="admin-secondary-button"
            >
              Ver todas →
            </Link>
          </div>


          {necesidades.length > 0 ? (
            <div className="admin-needs-list">

              {necesidades.map(
                (
                  necesidad,
                  index
                ) => (
                  <article
                    className="admin-need-row"
                    key={
                      necesidad.texto_normalizado
                    }
                  >
                    <span className="admin-need-position">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="admin-need-name">
                      <strong>
                        {
                          necesidad.texto_muestra
                        }
                      </strong>

                      <span>
                        Última búsqueda:{" "}
                        {formatearFecha(
                          necesidad.ultima_busqueda
                        )}
                      </span>
                    </div>

                    <div className="admin-need-count">
                      <strong>
                        {
                          necesidad.total_busquedas
                        }
                      </strong>

                      <span>
                        {necesidad.total_busquedas ===
                        1
                          ? "búsqueda"
                          : "búsquedas"}
                      </span>
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
                  No hay necesidades
                  pendientes
                </strong>

                <p>
                  Las búsquedas que no
                  encuentren resultado
                  aparecerán aquí.
                </p>
              </div>
            </div>
          )}

        </section>

      </section>
    </main>
  );
}