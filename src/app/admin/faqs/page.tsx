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


type FaqAdmin = {
  id: string;

  pregunta: string;
  respuesta: string;

  activa: boolean;
  orden: number;
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


export default function AdminFaqsPage() {
  const router =
    useRouter();


  const [
    faqs,
    setFaqs,
  ] =
    useState<FaqAdmin[]>(
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
      "todas" |
      "activas" |
      "inactivas"
    >("todas");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    changingId,
    setChangingId,
  ] =
    useState<string | null>(
      null
    );


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  useEffect(() => {
    async function cargarFaqs() {
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
          faqsError,
      } = await supabase
        .from("faqs")
        .select(`
          id,
          pregunta,
          respuesta,
          activa,
          orden
        `)
        .order(
          "orden",
          {
            ascending: true,
          }
        );


      if (
        faqsError
      ) {
        console.error(
          faqsError
        );

        setError(
          "No fue posible cargar las preguntas frecuentes."
        );

        setLoading(false);

        return;
      }


      setFaqs(
        (
          data ??
          []
        ) as FaqAdmin[]
      );


      setLoading(false);
    }


    cargarFaqs();

  }, [
    router,
  ]);


  const resultados =
    useMemo(() => {
      const texto =
        normalizar(
          query
        );


      return faqs.filter(
        (
          faq
        ) => {
          const coincideTexto =
            !texto ||
            normalizar(
              faq.pregunta
            ).includes(
              texto
            ) ||
            normalizar(
              faq.respuesta
            ).includes(
              texto
            );


          const coincideFiltro =
            filtro === "todas"
              ? true
              : filtro === "activas"
              ? faq.activa
              : !faq.activa;


          return (
            coincideTexto &&
            coincideFiltro
          );
        }
      );

    }, [
      faqs,
      query,
      filtro,
    ]);


  const activas =
    faqs.filter(
      (
        faq
      ) => faq.activa
    ).length;


  const inactivas =
    faqs.length -
    activas;


  async function cambiarEstado(
    faq: FaqAdmin
  ) {
    setChangingId(
      faq.id
    );

    setError(
      null
    );


    const nuevoEstado =
      !faq.activa;


    const {
      error:
        updateError,
    } = await supabase
      .from("faqs")
      .update({
        activa:
          nuevoEstado,
      })
      .eq(
        "id",
        faq.id
      );


    if (
      updateError
    ) {
      console.error(
        updateError
      );

      setError(
        "No fue posible cambiar el estado de la pregunta."
      );

      setChangingId(
        null
      );

      return;
    }


    setFaqs(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            faq.id
              ? {
                  ...item,

                  activa:
                    nuevoEstado,
                }
              : item
        )
    );


    setChangingId(
      null
    );
  }


  if (loading) {
    return (
      <main className="admin-loading-page">

        <div className="admin-loading-card">

          <span className="admin-loading-dot" />

          <p>
            Cargando preguntas frecuentes...
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
              Preguntas frecuentes
            </h1>

          </div>


          <Link
            href="/admin/faqs/nueva"
            className="admin-primary-button"
          >
            + Nueva pregunta
          </Link>

        </header>


        {error && (
          <div className="admin-page-error">
            {error}
          </div>
        )}


        <section className="admin-faq-summary">

          <article>

            <span>
              TOTAL
            </span>

            <strong>
              {
                faqs.length
              }
            </strong>

            <p>
              preguntas creadas
            </p>

          </article>


          <article>

            <span>
              ACTIVAS
            </span>

            <strong>
              {
                activas
              }
            </strong>

            <p>
              visibles públicamente
            </p>

          </article>


          <article>

            <span>
              INACTIVAS
            </span>

            <strong>
              {
                inactivas
              }
            </strong>

            <p>
              ocultas en la guía
            </p>

          </article>

        </section>


        <section className="admin-faq-toolbar">

          <div className="admin-needs-search">

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
              placeholder="Buscar preguntas..."
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


          <div className="admin-filter-tabs">

            <button
              type="button"
              className={
                filtro ===
                "todas"
                  ? "admin-filter-tab admin-filter-tab-active"
                  : "admin-filter-tab"
              }
              onClick={() =>
                setFiltro(
                  "todas"
                )
              }
            >
              Todas
            </button>


            <button
              type="button"
              className={
                filtro ===
                "activas"
                  ? "admin-filter-tab admin-filter-tab-active"
                  : "admin-filter-tab"
              }
              onClick={() =>
                setFiltro(
                  "activas"
                )
              }
            >
              Activas
            </button>


            <button
              type="button"
              className={
                filtro ===
                "inactivas"
                  ? "admin-filter-tab admin-filter-tab-active"
                  : "admin-filter-tab"
              }
              onClick={() =>
                setFiltro(
                  "inactivas"
                )
              }
            >
              Inactivas
            </button>

          </div>

        </section>


        <p className="admin-results-count">
          {
            resultados.length
          }{" "}
          {resultados.length === 1
            ? "pregunta"
            : "preguntas"}
        </p>


        {resultados.length > 0 ? (
          <section className="admin-faq-list">

            {resultados.map(
              (
                faq
              ) => (
                <article
                  key={
                    faq.id
                  }
                  className="admin-faq-row"
                >

                  <div className="admin-faq-order">

                    <span>
                      ORDEN
                    </span>

                    <strong>
                      {String(
                        faq.orden
                      ).padStart(
                        2,
                        "0"
                      )}
                    </strong>

                  </div>


                  <div className="admin-faq-content">

                    <strong>
                      {
                        faq.pregunta
                      }
                    </strong>

                    <p>
                      {
                        faq.respuesta
                      }
                    </p>

                  </div>


                  <div className="admin-faq-status">

                    <span
                      className={
                        faq.activa
                          ? "admin-status admin-status-published"
                          : "admin-status admin-status-draft"
                      }
                    >
                      {faq.activa
                        ? "Activa"
                        : "Inactiva"}
                    </span>

                  </div>


                  <div className="admin-faq-actions">

                    <button
                      type="button"
                      className="admin-faq-toggle-button"
                      onClick={() =>
                        cambiarEstado(
                          faq
                        )
                      }
                      disabled={
                        changingId ===
                        faq.id
                      }
                    >
                      {changingId ===
                      faq.id
                        ? "Guardando..."
                        : faq.activa
                        ? "Desactivar"
                        : "Activar"}
                    </button>


                    <Link
                      href={
                        `/admin/faqs/${faq.id}/editar`
                      }
                      className="admin-edit-button"
                    >
                      Editar →
                    </Link>

                  </div>

                </article>
              )
            )}

          </section>
        ) : (
          <div className="admin-empty-state">

            <span>
              ?
            </span>

            <div>

              <strong>
                No encontramos preguntas
              </strong>

              <p>
                Prueba otro término o cambia
                el filtro.
              </p>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}