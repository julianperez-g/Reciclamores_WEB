"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminResiduoForm from "@/components/admin/AdminResiduoForm";

import {
  getCurrentAdmin,
} from "@/lib/admin/auth";


export default function NuevoResiduoPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const nombreInicial =
    searchParams.get(
      "nombre"
    ) ?? "";


  const necesidadNormalizada =
    searchParams.get(
      "necesidad"
    );


  useEffect(() => {
    async function verificar() {
      const admin =
        await getCurrentAdmin();


      if (!admin) {
        router.replace(
          "/admin/login"
        );

        return;
      }


      setLoading(false);
    }


    verificar();
  }, [router]);


  if (loading) {
    return (
      <main className="admin-loading-page">
        <div className="admin-loading-card">
          <span className="admin-loading-dot" />

          <p>
            Cargando editor...
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
              NUEVA FICHA
            </p>

            <h1>
              Crear residuo
            </h1>
          </div>
        </header>


        {necesidadNormalizada && (
          <div className="admin-need-source-banner">

            <div className="admin-need-source-icon">
              ↗
            </div>

            <div>
              <strong>
                Creando desde una necesidad
                detectada
              </strong>

              <p>
                Los usuarios buscaron{" "}
                <b>
                  {nombreInicial}
                </b>
                . La ficha quedará vinculada
                automáticamente a esa necesidad.
              </p>
            </div>

          </div>
        )}


        <div className="admin-editor-warning">

          <strong>
            Contenido ambiental
          </strong>

          <p>
            Si la información aún no ha sido
            validada por Reciclamores, deja la
            ficha como borrador y con nivel
            “requiere revisión”.
          </p>

        </div>


        <AdminResiduoForm
          prefillName={
            nombreInicial
          }
          prefillAliases={
            necesidadNormalizada
              ? [
                  nombreInicial,
                  necesidadNormalizada,
                ]
              : []
          }
          necesidadNormalizada={
            necesidadNormalizada
          }
        />

      </section>

    </main>
  );
}