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

import AdminResiduoForm from "@/components/admin/AdminResiduoForm";

import AdminResiduoImageManager from "@/components/admin/AdminResiduoImageManager";

import DeleteResiduoButton from "@/components/admin/DeleteResiduoButton";

import type {
  ResiduoFormData,
} from "@/components/admin/AdminResiduoForm";

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


export default function EditarResiduoPage({
  params,
}: Props) {
  const {
    id,
  } = use(params);


  const router =
    useRouter();


  const [
    data,
    setData,
  ] =
    useState<ResiduoFormData | null>(
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
        data:
          residuo,
        error:
          residuoError,
      } = await supabase
        .from("residuos")
        .select(`
          id,
          nombre,
          slug,
          duda_real,
          respuesta_corta,
          estado_general,
          va_reciclaje_convencional,
          reciclaje_convencional_detalle,
          se_entrega_reciclador,
          reciclador_detalle,
          como_preparar,
          nunca_hacer,
          tipo_ruta,
          indicacion_ruta,
          fuente_tecnica,
          fuente_url,
          fecha_verificacion,
          estado_publicacion,
          nivel_certeza,
          destacado,
          orden_destacado,
          imagen_path,
          imagen_alt
        `)
        .eq(
          "id",
          id
        )
        .single();


      if (
        residuoError ||
        !residuo
      ) {
        console.error(
          residuoError
        );

        setError(
          "No fue posible cargar la ficha."
        );

        setLoading(false);

        return;
      }


      const {
        data:
          aliases,
        error:
          aliasesError,
      } = await supabase
        .from(
          "residuo_aliases"
        )
        .select(
          "alias"
        )
        .eq(
          "residuo_id",
          id
        )
        .order(
          "alias",
          {
            ascending: true,
          }
        );


      if (
        aliasesError
      ) {
        console.error(
          aliasesError
        );
      }


      setData({
        id:
          residuo.id,

        nombre:
          residuo.nombre ??
          "",

        slug:
          residuo.slug ??
          "",

        duda_real:
          residuo.duda_real ??
          "",

        respuesta_corta:
          residuo
            .respuesta_corta ??
          "",

        estado_general:
          residuo
            .estado_general ??
          null,

        va_reciclaje_convencional:
          residuo
            .va_reciclaje_convencional ??
          null,

        reciclaje_convencional_detalle:
          residuo
            .reciclaje_convencional_detalle ??
          "",

        se_entrega_reciclador:
          residuo
            .se_entrega_reciclador ??
          null,

        reciclador_detalle:
          residuo
            .reciclador_detalle ??
          "",

        como_preparar:
          residuo
            .como_preparar ??
          "",

        nunca_hacer:
          residuo
            .nunca_hacer ??
          "",

        tipo_ruta:
          residuo
            .tipo_ruta ??
          null,

        indicacion_ruta:
          residuo
            .indicacion_ruta ??
          "",

        fuente_tecnica:
          residuo
            .fuente_tecnica ??
          "",

        fuente_url:
          residuo
            .fuente_url ??
          "",

        fecha_verificacion:
          residuo
            .fecha_verificacion ??
          "",

        estado_publicacion:
          residuo
            .estado_publicacion,

        nivel_certeza:
          residuo
            .nivel_certeza,

        destacado:
          Boolean(
            residuo.destacado
          ),

        orden_destacado:
          residuo
            .orden_destacado ??
          null,

        imagen_path:
          residuo
            .imagen_path ??
          null,

        imagen_alt:
          residuo
            .imagen_alt ??
          "",

        aliases:
          (
            aliases ??
            []
          ).map(
            (
              item
            ) =>
              item.alias
          ),
      });


      setLoading(false);
    }


    cargar();

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
            Cargando ficha...
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
              EDITAR FICHA
            </p>

            <h1>
              {data?.nombre ??
                "Residuo"}
            </h1>
          </div>
        </header>


        {error ? (
          <div className="admin-page-error">
            {error}
          </div>

        ) : data ? (
          <>

            <AdminResiduoForm
              initialData={
                data
              }
            >

              <AdminResiduoImageManager
                residuoId={
                  data.id!
                }
                nombre={
                  data.nombre
                }
              />

            </AdminResiduoForm>


            <section className="admin-danger-zone">

              <div className="admin-danger-zone-heading">

                <span>
                  ZONA DE PELIGRO
                </span>

                <h2>
                  Eliminar este residuo
                </h2>

              </div>


              <DeleteResiduoButton
                residuoId={
                  data.id!
                }

                nombre={
                  data.nombre
                }

                estadoPublicacion={
                  data.estado_publicacion
                }

                imagenPath={
                  data.imagen_path
                }
              />

            </section>

          </>
        ) : null}

      </section>

    </main>
  );
}