import { supabase } from "@/lib/supabase/client";

const RESIDUOS_BUCKET = "residuos";

export function getResiduoImageUrl(
  imagenPath: string | null | undefined
): string | null {
  if (!imagenPath) {
    return null;
  }

  const { data } = supabase.storage
    .from(RESIDUOS_BUCKET)
    .getPublicUrl(imagenPath);

  return data.publicUrl;
}