import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY;

const BUCKET = "residuos";

const IMAGES_DIRECTORY = path.resolve(
  process.cwd(),
  "imagenes-residuos"
);

if (!SUPABASE_URL) {
  console.error(
    "❌ Falta NEXT_PUBLIC_SUPABASE_URL en .env.local"
  );

  process.exit(1);
}

if (!SUPABASE_SECRET_KEY) {
  console.error(
    "❌ Falta SUPABASE_SECRET_KEY en .env.local"
  );

  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const residuos = [
  {
    slug: "aceite-cocina-usado",
    filename: "aceite-cocina-usado.webp",
    alt: "Recipiente con aceite de cocina usado",
  },
  {
    slug: "bombillos-luminarias",
    filename: "bombillos-luminarias.webp",
    alt: "Bombillos y luminarias domésticas",
  },
  {
    slug: "caja-pizza-carton-grasa",
    filename: "caja-pizza-carton-grasa.webp",
    alt: "Caja de pizza y cartón con grasa",
  },
  {
    slug: "celulares-cargadores-cables",
    filename: "celulares-cargadores-cables.webp",
    alt: "Celulares, cargadores, cables y pequeños electrónicos",
  },
  {
    slug: "envases-insecticidas-plaguicidas",
    filename: "envases-insecticidas-plaguicidas.webp",
    alt: "Envases domésticos de insecticidas y plaguicidas",
  },
  {
    slug: "espejos",
    filename: "espejos.webp",
    alt: "Espejos de uso doméstico",
  },
  {
    slug: "icopor",
    filename: "icopor.webp",
    alt: "Piezas de icopor o poliestireno expandido",
  },
  {
    slug: "jeringas-agujas-lancetas",
    filename: "jeringas-agujas-lancetas.webp",
    alt: "Jeringas, agujas y lancetas",
  },
  {
    slug: "llantas-usadas",
    filename: "llantas-usadas.webp",
    alt: "Llantas usadas",
  },
  {
    slug: "medicamentos-vencidos",
    filename: "medicamentos-vencidos.webp",
    alt: "Medicamentos vencidos o parcialmente consumidos",
  },
  {
    slug: "neveras-equipos-refrigeracion",
    filename: "neveras-equipos-refrigeracion.webp",
    alt: "Nevera y equipo doméstico de refrigeración",
  },
  {
    slug: "pilas-domesticas",
    filename: "pilas-domesticas.webp",
    alt: "Pilas domésticas y pilas botón",
  },
  {
    slug: "radiografias",
    filename: "radiografias.webp",
    alt: "Placas de radiografía",
  },
  {
    slug: "ropa-buen-estado",
    filename: "ropa-buen-estado.webp",
    alt: "Ropa limpia en buen estado",
  },
  {
    slug: "ropa-rota-textil-deteriorado",
    filename: "ropa-rota-textil-deteriorado.webp",
    alt: "Ropa rota y textiles deteriorados",
  },
  {
    slug: "vidrio-roto-ceramica",
    filename: "vidrio-roto-ceramica.webp",
    alt: "Fragmentos de vidrio roto y cerámica",
  },
];

async function verificarImagenes() {
  console.log("");
  console.log("🔎 Verificando las 16 imágenes...");
  console.log("");

  const faltantes = [];

  for (const residuo of residuos) {
    const filePath = path.join(
      IMAGES_DIRECTORY,
      residuo.filename
    );

    try {
      await fs.access(filePath);

      console.log(
        `✓ ${residuo.filename}`
      );
    } catch {
      faltantes.push(
        residuo.filename
      );

      console.log(
        `✗ ${residuo.filename}`
      );
    }
  }

  if (faltantes.length > 0) {
    console.log("");

    console.error(
      "❌ Faltan imágenes. No se realizará ninguna subida."
    );

    console.log("");

    for (const archivo of faltantes) {
      console.error(
        `- ${archivo}`
      );
    }

    process.exit(1);
  }

  console.log("");
  console.log(
    "✅ Las 16 imágenes están listas."
  );
}

async function subirResiduo(
  residuo
) {
  const localPath = path.join(
    IMAGES_DIRECTORY,
    residuo.filename
  );

  const storagePath =
    `${residuo.slug}/principal.webp`;

  const fileBuffer =
    await fs.readFile(
      localPath
    );

  const {
    error: uploadError,
  } = await supabase.storage
    .from(BUCKET)
    .upload(
      storagePath,
      fileBuffer,
      {
        contentType:
          "image/webp",

        cacheControl:
          "3600",

        upsert:
          true,
      }
    );

  if (uploadError) {
    throw new Error(
      `Error subiendo ${residuo.filename}: ${uploadError.message}`
    );
  }

  const {
    error: updateError,
  } = await supabase
    .from("residuos")
    .update({
      imagen_path:
        storagePath,

      imagen_alt:
        residuo.alt,

      imagen_tipo:
        "generada_ia",
    })
    .eq(
      "slug",
      residuo.slug
    );

  if (updateError) {
    throw new Error(
      `La imagen se subió, pero no se pudo actualizar ${residuo.slug}: ${updateError.message}`
    );
  }

  console.log(
    `✓ ${residuo.slug} → ${storagePath}`
  );
}

async function main() {
  await verificarImagenes();

  console.log("");
  console.log(
    "☁️ Subiendo imágenes a Supabase Storage..."
  );
  console.log("");

  let completadas = 0;

  for (const residuo of residuos) {
    try {
      await subirResiduo(
        residuo
      );

      completadas += 1;
    } catch (error) {
      console.log("");

      console.error(
        `❌ Error procesando ${residuo.slug}`
      );

      console.error(
        error instanceof Error
          ? error.message
          : error
      );

      process.exit(1);
    }
  }

  console.log("");

  console.log(
    `🎉 Proceso terminado: ${completadas}/16 imágenes procesadas correctamente.`
  );

  console.log("");

  console.log(
    "Las imágenes quedaron enlazadas automáticamente con sus fichas."
  );
}

main();