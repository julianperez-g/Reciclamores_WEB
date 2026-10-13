"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminFaqForm from "@/components/admin/AdminFaqForm";

import type {
  FaqFormData,
} from "@/components/admin/AdminFaqForm";

import {
  getCurrentAdmin,
} from "@/lib/admin/auth";

import {
  supabase,
} from "@/lib/supabase/client";


export default function NuevaFaqPage() {
  const router =
    useRouter();


  const [
    initialData,
    setInitialData,
  ] =
    useState<FaqFormData | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {
    async function preparar() {
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
        error,
      } = await supabase
        .from("faqs")
        .select(
          "orden"
        )
        .order(
          "orden",
          {
            ascending: false,
          }
        )
        .limit(
          1
        );


      if (error) {
        console.error(
          error
        );
      }


      const ultimoOrden =
        data?.[0]?.orden ??
        0;


      setInitialData({
        pregunta: "",
        respuesta: "",

        orden:
          Number(
            ultimoOrden
          ) + 1,

        activa:
          false,
      });


      setLoading(false);
    }


    preparar();

  }, [
    router,
  ]);


  if (
    loading ||
    !initialData
  ) {
    return (
      <main className="admin-loading-page">

        <div className="admin-loading-card">

          <span className="admin-loading-dot" />

          <p>
            Preparando nueva pregunta...
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
              NUEVA FAQ
            </p>

            <h1>
              Crear pregunta
            </h1>

          </div>

        </header>


        <div className="admin-faq-info-banner">

          <strong>
            Publicación controlada
          </strong>

          <p>
            Las preguntas nuevas se crean
            inactivas por defecto. Actívala
            cuando la respuesta esté lista.
          </p>

        </div>


        <AdminFaqForm
          mode="create"
          initialData={
            initialData
          }
        />

      </section>

    </main>
  );
}