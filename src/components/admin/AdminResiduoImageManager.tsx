"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getResiduoImageUrl,
} from "@/lib/supabase/storage";

import {
  supabase,
} from "@/lib/supabase/client";


const MAX_FILE_SIZE =
  2 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/webp",
  "image/png",
  "image/jpeg",
];


type ImageType =
  | "generada_ia"
  | "propia_reciclamores"
  | "tercero_autorizado";


type ImageData = {
  imagen_path: string | null;
  imagen_alt: string;
  imagen_tipo: ImageType | null;
  imagen_credito: string;
};


type Props = {
  residuoId: string;
  nombre: string;
};


function extensionFromMime(
  mime: string
) {
  if (mime === "image/webp") {
    return "webp";
  }

  if (mime === "image/png") {
    return "png";
  }

  return "jpg";
}


function fileSizeLabel(
  bytes: number
) {
  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`;
}


export default function AdminResiduoImageManager({
  residuoId,
  nombre,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    imageData,
    setImageData,
  ] =
    useState<ImageData>({
      imagen_path: null,
      imagen_alt: "",
      imagen_tipo: null,
      imagen_credito: "",
    });


  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null
    );


  const [
    localPreview,
    setLocalPreview,
  ] =
    useState<string | null>(
      null
    );


  const [
    dragActive,
    setDragActive,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null
    );


  useEffect(() => {
    async function cargarImagen() {
      setLoading(true);
      setError(null);

      const {
        data,
        error:
          imagenError,
      } = await supabase
        .from("residuos")
        .select(`
          imagen_path,
          imagen_alt,
          imagen_tipo,
          imagen_credito
        `)
        .eq(
          "id",
          residuoId
        )
        .single();


      if (
        imagenError ||
        !data
      ) {
        console.error(
          imagenError
        );

        setError(
          "No fue posible cargar la imagen de esta ficha."
        );

        setLoading(false);

        return;
      }


      setImageData({
        imagen_path:
          data.imagen_path ??
          null,

        imagen_alt:
          data.imagen_alt ??
          "",

        imagen_tipo:
          data.imagen_tipo ??
          null,

        imagen_credito:
          data.imagen_credito ??
          "",
      });


      setLoading(false);
    }


    cargarImagen();

  }, [
    residuoId,
  ]);


  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview(
        null
      );

      return;
    }


    const url =
      URL.createObjectURL(
        selectedFile
      );


    setLocalPreview(
      url
    );


    return () => {
      URL.revokeObjectURL(
        url
      );
    };

  }, [
    selectedFile,
  ]);


  const currentImageUrl =
    useMemo(
      () =>
        getResiduoImageUrl(
          imageData.imagen_path
        ),
      [
        imageData.imagen_path,
      ]
    );


  const previewUrl =
    localPreview ||
    currentImageUrl;


  function validarArchivo(
    file: File
  ) {
    if (
      !ACCEPTED_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "El archivo debe ser WEBP, PNG o JPG."
      );

      return false;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "La imagen supera el límite de 2 MB. Comprímela antes de subirla."
      );

      return false;
    }


    return true;
  }


  function seleccionarArchivo(
    file: File
  ) {
    setError(null);
    setSuccess(null);


    if (
      !validarArchivo(
        file
      )
    ) {
      return;
    }


    setSelectedFile(
      file
    );


    if (
      !imageData.imagen_alt
    ) {
      setImageData(
        (
          current
        ) => ({
          ...current,

          imagen_alt:
            nombre,
        })
      );
    }
  }


  function abrirExplorador() {
    inputRef
      .current
      ?.click();
  }


  function handleInputChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0];


    if (!file) {
      return;
    }


    seleccionarArchivo(
      file
    );


    event.target.value = "";
  }


  function handleDragOver(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(
      true
    );
  }


  function handleDragLeave(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(
      false
    );
  }


  function handleDrop(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(
      false
    );


    const file =
      event.dataTransfer
        .files?.[0];


    if (!file) {
      return;
    }


    seleccionarArchivo(
      file
    );
  }


  async function guardarImagen() {
    setSaving(true);
    setError(null);
    setSuccess(null);


    try {
      const alt =
        imageData
          .imagen_alt
          .trim();


      if (!alt) {
        throw new Error(
          "Debes escribir un texto alternativo para la imagen."
        );
      }


      if (
        !imageData.imagen_tipo
      ) {
        throw new Error(
          "Selecciona el tipo de imagen."
        );
      }


      if (
        imageData.imagen_tipo ===
          "tercero_autorizado" &&
        !imageData
          .imagen_credito
          .trim()
      ) {
        throw new Error(
          "Para una imagen de tercero autorizado debes indicar el crédito."
        );
      }


      let nuevoPath =
        imageData.imagen_path;


      if (selectedFile) {
        const {
          data:
            residuoActual,
          error:
            slugError,
        } = await supabase
          .from("residuos")
          .select(
            "slug"
          )
          .eq(
            "id",
            residuoId
          )
          .single();


        if (
          slugError ||
          !residuoActual
        ) {
          throw new Error(
            "No fue posible obtener el slug actual de la ficha."
          );
        }


        const extension =
          extensionFromMime(
            selectedFile.type
          );


        nuevoPath =
          `${residuoActual.slug}/principal-${Date.now()}.${extension}`;


        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              "residuos"
            )
            .upload(
              nuevoPath,
              selectedFile,
              {
                contentType:
                  selectedFile.type,

                cacheControl:
                  "3600",

                upsert:
                  false,
              }
            );


        if (
          uploadError
        ) {
          throw new Error(
            `No fue posible subir la imagen: ${uploadError.message}`
          );
        }
      }


      if (!nuevoPath) {
        throw new Error(
          "Selecciona una imagen antes de guardar."
        );
      }


      const pathAnterior =
        imageData.imagen_path;


      const {
        error:
          updateError,
      } = await supabase
        .from("residuos")
        .update({
          imagen_path:
            nuevoPath,

          imagen_alt:
            alt,

          imagen_tipo:
            imageData
              .imagen_tipo,

          imagen_credito:
            imageData
              .imagen_credito
              .trim() ||
            null,
        })
        .eq(
          "id",
          residuoId
        );


      if (
        updateError
      ) {
        if (
          selectedFile &&
          nuevoPath
        ) {
          await supabase.storage
            .from(
              "residuos"
            )
            .remove([
              nuevoPath,
            ]);
        }


        throw new Error(
          `La imagen se subió, pero no fue posible actualizar la ficha: ${updateError.message}`
        );
      }


      if (
        selectedFile &&
        pathAnterior &&
        pathAnterior !==
          nuevoPath
      ) {
        const {
          error:
            removeOldError,
        } =
          await supabase.storage
            .from(
              "residuos"
            )
            .remove([
              pathAnterior,
            ]);


        if (
          removeOldError
        ) {
          console.warn(
            "La nueva imagen quedó guardada, pero no se pudo eliminar la anterior:",
            removeOldError
          );
        }
      }


      setImageData(
        (
          current
        ) => ({
          ...current,

          imagen_path:
            nuevoPath,

          imagen_alt:
            alt,
        })
      );


      setSelectedFile(
        null
      );


      setSuccess(
        selectedFile
          ? "Imagen guardada correctamente."
          : "Datos de la imagen actualizados."
      );


    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la imagen."
      );

    } finally {
      setSaving(false);
    }
  }


  async function eliminarImagen() {
    if (
      !imageData.imagen_path
    ) {
      return;
    }


    const confirmado =
      window.confirm(
        `¿Eliminar la imagen actual de "${nombre}"?`
      );


    if (!confirmado) {
      return;
    }


    setSaving(true);
    setError(null);
    setSuccess(null);


    try {
      const pathActual =
        imageData.imagen_path;


      const {
        error:
          storageError,
      } =
        await supabase.storage
          .from(
            "residuos"
          )
          .remove([
            pathActual,
          ]);


      if (
        storageError
      ) {
        throw new Error(
          `No fue posible eliminar el archivo: ${storageError.message}`
        );
      }


      const {
        error:
          updateError,
      } = await supabase
        .from("residuos")
        .update({
          imagen_path:
            null,

          imagen_alt:
            null,

          imagen_tipo:
            null,

          imagen_credito:
            null,
        })
        .eq(
          "id",
          residuoId
        );


      if (
        updateError
      ) {
        throw new Error(
          `El archivo se eliminó, pero no fue posible actualizar la ficha: ${updateError.message}`
        );
      }


      setSelectedFile(
        null
      );


      setImageData({
        imagen_path:
          null,

        imagen_alt:
          "",

        imagen_tipo:
          null,

        imagen_credito:
          "",
      });


      setSuccess(
        "Imagen eliminada correctamente."
      );


    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la imagen."
      );

    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <section className="admin-image-section">
        <div className="admin-image-loading">
          Cargando imagen...
        </div>
      </section>
    );
  }


  return (
    <section className="admin-image-section">

      <div className="admin-form-section-heading">

        <div>
          <span className="admin-form-number">
            06
          </span>

          <div>
            <h2>
              Imagen
            </h2>

            <p>
              Imagen principal que ayuda a
              identificar visualmente este
              residuo.
            </p>
          </div>
        </div>


        {imageData.imagen_path && (
          <span className="admin-image-status">
            ✓ Imagen cargada
          </span>
        )}

      </div>


      <div className="admin-image-layout">

        <div className="admin-image-upload-column">

          <div
            className={
              dragActive
                ? "admin-image-dropzone admin-image-dropzone-active"
                : "admin-image-dropzone"
            }
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={
              handleDrop
            }
          >

            <input
              ref={
                inputRef
              }
              type="file"
              accept="image/webp,image/png,image/jpeg"
              onChange={
                handleInputChange
              }
              hidden
            />


            <div className="admin-image-drop-icon">
              ↑
            </div>


            <strong className="admin-image-drop-title">
              {imageData.imagen_path
                ? "Cambiar imagen"
                : "Cargar imagen"}
            </strong>


            <p className="admin-image-drag-copy">
              Arrastra un archivo hasta aquí
            </p>


            <div className="admin-image-or">
              <span />
              <b>
                o
              </b>
              <span />
            </div>


            <button
              type="button"
              className="admin-image-picker-button"
              onClick={
                abrirExplorador
              }
            >
              Seleccionar archivo
            </button>


            <span className="admin-image-requirements">
              WEBP · PNG · JPG · máximo 2 MB
            </span>

          </div>


          {selectedFile && (
            <div className="admin-image-file-info">

              <div>
                <strong>
                  {
                    selectedFile.name
                  }
                </strong>

                <span>
                  {fileSizeLabel(
                    selectedFile.size
                  )}
                </span>
              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedFile(
                    null
                  )
                }
              >
                Quitar
              </button>

            </div>
          )}

        </div>


        <div className="admin-image-preview-card">

          {previewUrl ? (
            <img
              src={
                previewUrl
              }
              alt={
                imageData.imagen_alt ||
                nombre
              }
            />
          ) : (
            <div className="admin-image-empty-preview">

              <span>
                ◇
              </span>

              <strong>
                Vista previa
              </strong>

              <p>
                Cuando selecciones una imagen,
                aparecerá aquí antes de
                guardarla.
              </p>

            </div>
          )}

        </div>

      </div>


      <div className="admin-image-fields">

        <div className="admin-field">

          <label>
            Texto alternativo *
          </label>

          <input
            type="text"
            value={
              imageData.imagen_alt
            }
            onChange={(
              event
            ) =>
              setImageData(
                (
                  current
                ) => ({
                  ...current,

                  imagen_alt:
                    event.target.value,
                })
              )
            }
            placeholder={`Ej. ${nombre}`}
          />

          <small className="admin-field-help">
            Describe brevemente lo que se ve
            en la imagen para accesibilidad.
          </small>

        </div>


        <div className="admin-form-grid">

          <div className="admin-field">

            <label>
              Tipo de imagen *
            </label>

            <select
              value={
                imageData.imagen_tipo ??
                ""
              }
              onChange={(
                event
              ) =>
                setImageData(
                  (
                    current
                  ) => ({
                    ...current,

                    imagen_tipo:
                      event.target.value
                        ? event.target
                            .value as ImageType
                        : null,
                  })
                )
              }
            >
              <option value="">
                Seleccionar
              </option>

              <option value="generada_ia">
                Generada digitalmente
              </option>

              <option value="propia_reciclamores">
                Propia de Reciclamores
              </option>

              <option value="tercero_autorizado">
                Tercero autorizado
              </option>
            </select>

          </div>


          <div className="admin-field">

            <label>
              Crédito
            </label>

            <input
              type="text"
              value={
                imageData
                  .imagen_credito
              }
              onChange={(
                event
              ) =>
                setImageData(
                  (
                    current
                  ) => ({
                    ...current,

                    imagen_credito:
                      event.target.value,
                  })
                )
              }
              placeholder={
                imageData.imagen_tipo ===
                "tercero_autorizado"
                  ? "Fuente o autor"
                  : "Opcional"
              }
            />

          </div>

        </div>

      </div>


      {error && (
        <div className="admin-page-error">
          {error}
        </div>
      )}


      {success && (
        <div className="admin-form-success">
          ✓ {success}
        </div>
      )}


      <div className="admin-image-actions">

        {imageData.imagen_path && (
          <button
            type="button"
            className="admin-image-delete-button"
            onClick={
              eliminarImagen
            }
            disabled={
              saving
            }
          >
            Eliminar imagen
          </button>
        )}


        <button
          type="button"
          className="admin-primary-button"
          onClick={
            guardarImagen
          }
          disabled={
            saving ||
            (
              !selectedFile &&
              !imageData.imagen_path
            )
          }
        >
          {saving
            ? "Guardando..."
            : selectedFile
            ? "Guardar nueva imagen"
            : "Guardar datos de imagen"}
        </button>

      </div>

    </section>
  );
}