"use client";

import { useState } from "react";

type ShareActionsProps = {
  nombre: string;
};

export default function ShareActions({
  nombre,
}: ShareActionsProps) {
  const [copiado, setCopiado] = useState(false);

  function compartirWhatsApp() {
    const urlActual = window.location.href;

    const mensaje = `Mira esta guía de Reciclamores sobre ${nombre}:\n${urlActual}`;

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copiarEnlace() {
    try {
      const urlActual = window.location.href;

      await navigator.clipboard.writeText(
        urlActual
      );

      setCopiado(true);

      window.setTimeout(() => {
        setCopiado(false);
      }, 2500);
    } catch (error) {
      console.error(
        "No se pudo copiar el enlace:",
        error
      );
    }
  }

  return (
    <section
      style={{
        marginTop: "48px",
        padding: "30px",
        borderRadius: "24px",
        background: "#f7fbfc",
        border: "1px solid #dcebef",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#12bfd0",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.13em",
        }}
      >
        COMPARTE ESTA INFORMACIÓN
      </p>

      <h2
        style={{
          margin: "0 0 8px",
          color: "#10365d",
          fontSize: "24px",
        }}
      >
        ¿Te sirvió esta ficha?
      </h2>

      <p
        style={{
          margin: "0 0 22px",
          color: "#647786",
          lineHeight: 1.6,
        }}
      >
        Compártela con alguien que también
        tenga esta duda.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={compartirWhatsApp}
          style={{
            minHeight: "48px",
            padding: "0 20px",
            border: 0,
            borderRadius: "999px",
            background: "#10365d",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Compartir por WhatsApp
        </button>

        <button
          type="button"
          onClick={copiarEnlace}
          style={{
            minHeight: "48px",
            padding: "0 20px",
            border: "1px solid #dcebef",
            borderRadius: "999px",
            background: "#ffffff",
            color: "#10365d",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copiado
            ? "✓ Enlace copiado"
            : "Copiar enlace"}
        </button>
      </div>
    </section>
  );
}