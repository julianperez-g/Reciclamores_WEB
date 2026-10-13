"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminFaqForm from "@/components/admin/AdminFaqForm";

import DeleteFaqButton from "@/components/admin/DeleteFaqButton";

import type {
  FaqFormData,
} from "@/components/admin/AdminFaqForm";

import {
  getCurrentAdmin,
} from "@/lib/admin/auth";

import {
  supabase,
} from "@/lib/supabase/client";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


export default function EditarFaqPage({
  params,
}: Props) {
  const {
    id,
  } = use(
    params
  );


  const router =
    useRouter();


  const [
    faq,
    setFaq,
  ] =
    useState<FaqFormData | null>(
      null
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
    async function cargarFaq() {
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
          faqError,
      } = await supabase
        .from("faqs")
        .select(`
          id,
          pregunta,
          respuesta,
          activa,
          orden
        `)
        .eq(
          "id",
          id
        )
        .single();


      if (
        faqError ||
        !data
      ) {
        console.error(
          faqError
        );

        setError(
          "No fue posible cargar la pregunta."
        );

        setLoading(false);

        return;
      }


      setFaq({
        id:
          data.id,

        pregunta:
          data.pregunta ??
          "",

        respuesta:
          data.respuesta ??
          "",

        activa:
          Boolean(
            data.activa
          ),

        orden:
          Number(
            data.orden
          ) || 1,
      });


      setLoading(false);
    }


    cargarFaq();

  }, [
    id,
    router,
  ]);


  if (loading) {
    return (
      <main className="admin-loading-page">

        <div className="admin-loading-card">

          <span className="admin-loading-dot" />

          <p>
            Cargando pregunta...
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
              EDITAR FAQ
            </p>

            <h1>
              Pregunta frecuente
            </h1>

          </div>

        </header>


        {error ? (
          <div className="admin-page-error">
            {error}
          </div>

        ) : faq ? (
          <>

            <AdminFaqForm
              mode="edit"
              initialData={
                faq
              }
            />


            <section className="admin-danger-zone">

              <div className="admin-danger-zone-heading">

                <span>
                  ZONA DE PELIGRO
                </span>

                <h2>
                  Eliminar esta pregunta
                </h2>

              </div>


              <DeleteFaqButton
                faqId={
                  faq.id!
                }
                pregunta={
                  faq.pregunta
                }
              />

            </section>

          </>
        ) : null}

      </section>

    </main>
  );
}