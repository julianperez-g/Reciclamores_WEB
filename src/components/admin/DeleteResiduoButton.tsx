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
  residuoId: string;
  nombre: string;

  estadoPublicacion:
    string;

  imagenPath:
    string | null;
};


export default function DeleteResiduoButton({
  residuoId,
  nombre,
  estadoPublicacion,
  imagenPath,
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


  async function eliminarResiduo() {
    const estaPublicado =
      estadoPublicacion ===
      "publicado";


    const mensaje =
      estaPublicado
        ? `La ficha "${nombre}" está publicada.\n\nSi la eliminas desaparecerá de la guía pública y cualquier necesidad relacionada volverá a quedar pendiente.\n\n¿Seguro que quieres eliminarla definitivamente?`
        : `¿Seguro que quieres eliminar el borrador "${nombre}"?\n\nSi nació de una necesidad, esa necesidad volverá a quedar pendiente.`;


    const confirmado =
      window.confirm(
        mensaje
      );


    if (!confirmado) {
      return;
    }


    setLoading(true);
    setError(null);


    try {
      /*
       * 1. Reabrimos cualquier búsqueda fallida
       * vinculada a esta ficha.
       *
       * Así, al eliminar por ejemplo
       * "Colchon Marciano", vuelve a aparecer
       * automáticamente en Necesidades.
       */
      const {
        error:
          busquedasError,
      } = await supabase
        .from("busquedas")
        .update({
          gestionada:
            false,

          gestionada_at:
            null,

          residuo_relacionado_id:
            null,
        })
        .eq(
          "residuo_relacionado_id",
          residuoId
        )
        .eq(
          "encontro_resultado",
          false
        );


      if (busquedasError) {
        throw new Error(
          `No fue posible reabrir las necesidades relacionadas: ${busquedasError.message}`
        );
      }


      /*
       * 2. Eliminamos aliases explícitamente.
       *
       * Aunque la relación pueda tener cascade,
       * así el flujo queda controlado desde CMS.
       */
      const {
        error:
          aliasesError,
      } = await supabase
        .from(
          "residuo_aliases"
        )
        .delete()
        .eq(
          "residuo_id",
          residuoId
        );


      if (aliasesError) {
        throw new Error(
          `No fue posible eliminar los sinónimos: ${aliasesError.message}`
        );
      }


      /*
       * 3. Eliminamos la ficha.
       */
      const {
        error:
          residuoError,
      } = await supabase
        .from("residuos")
        .delete()
        .eq(
          "id",
          residuoId
        );


      if (residuoError) {
        throw new Error(
          `No fue posible eliminar la ficha: ${residuoError.message}`
        );
      }


      /*
       * 4. Limpieza de imagen.
       *
       * Es secundaria: si por cualquier motivo
       * falla Storage, la ficha ya fue eliminada
       * correctamente y solo quedaría un archivo
       * huérfano para limpiar posteriormente.
       */
      if (imagenPath) {
        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              "residuos"
            )
            .remove([
              imagenPath,
            ]);


        if (storageError) {
          console.warn(
            "La ficha fue eliminada, pero no se pudo limpiar la imagen:",
            storageError
          );
        }
      }


      router.replace(
        "/admin/residuos"
      );

      router.refresh();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la ficha."
      );

      setLoading(false);
    }
  }


  return (
    <div className="admin-delete-area">

      <div>
        <strong>
          Eliminar ficha
        </strong>

        <p>
          Esta acción elimina la ficha,
          sus sinónimos y vuelve a abrir
          cualquier necesidad relacionada.
        </p>
      </div>


      <button
        type="button"
        className="admin-delete-button"
        onClick={
          eliminarResiduo
        }
        disabled={
          loading
        }
      >
        {loading
          ? "Eliminando..."
          : "Eliminar ficha"}
      </button>


      {error && (
        <div className="admin-delete-error">
          {error}
        </div>
      )}

    </div>
  );
}