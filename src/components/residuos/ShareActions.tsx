"use client";

import {
  useState,
} from "react";


type Props = {
  nombre: string;
};


export default function ShareActions({
  nombre,
}: Props) {
  const [
    copied,
    setCopied,
  ] =
    useState(false);


  function compartirWhatsApp() {
    const urlActual =
      window.location.href;


    const mensaje =
      `Mira esta guía de Reciclamores sobre ${nombre}:\n${urlActual}`;


    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        mensaje
      )}`;


    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }


  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );


      setCopied(
        true
      );


      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        2200
      );

    } catch {
      setCopied(
        false
      );
    }
  }


  return (
    <div className="residue-share-actions">

      <button
        type="button"
        className="residue-share-whatsapp"
        onClick={
          compartirWhatsApp
        }
      >
        <span className="residue-share-icon">
          ↗
        </span>

        <span>
          Compartir por WhatsApp
        </span>
      </button>


      <button
        type="button"
        className="residue-share-copy"
        onClick={
          copiarEnlace
        }
      >
        <span className="residue-share-icon">
          ⧉
        </span>

        <span>
          {copied
            ? "✓ Enlace copiado"
            : "Copiar enlace"}
        </span>
      </button>

    </div>
  );
}