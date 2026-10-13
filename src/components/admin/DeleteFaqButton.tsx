"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase/client";


type Props = {
  faqId: string;
  pregunta: string;
};


export default function DeleteFaqButton({
  faqId,
  pregunta,
}: Props) {
  const router =
    useRouter();


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  async function eliminarFaq() {
    const confirmado =
      window.confirm(
        `¿Seguro que quieres eliminar esta pregunta?\n\n"${pregunta}"\n\nEsta acción no se puede deshacer.`
      );


    if (!confirmado) {
      return;
    }


    setLoading(true);
    setError(null);


    const {
      error:
        deleteError,
    } = await supabase
      .from("faqs")
      .delete()
      .eq(
        "id",
        faqId
      );


    if (
      deleteError
    ) {
      console.error(
        deleteError
      );

      setError(
        "No fue posible eliminar la pregunta."
      );

      setLoading(false);

      return;
    }


    router.replace(
      "/admin/faqs"
    );

    router.refresh();
  }


  return (
    <div className="admin-delete-area">

      <div>

        <strong>
          Eliminar pregunta
        </strong>

        <p>
          La pregunta desaparecerá
          definitivamente del CMS y de la
          guía pública.
        </p>

      </div>


      <button
        type="button"
        className="admin-delete-button"
        onClick={
          eliminarFaq
        }
        disabled={
          loading
        }
      >
        {loading
          ? "Eliminando..."
          : "Eliminar pregunta"}
      </button>


      {error && (
        <div className="admin-delete-error">
          {error}
        </div>
      )}

    </div>
  );
}