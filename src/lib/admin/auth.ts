import { supabase } from "@/lib/supabase/client";

export type AdminProfile = {
  user_id: string;
  nombre: string | null;
  activo: boolean;
};

export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return null;
  }

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("admin_users")
    .select(`
      user_id,
      nombre,
      activo
    `)
    .eq(
      "user_id",
      user.id
    )
    .eq(
      "activo",
      true
    )
    .maybeSingle();

  if (
    adminError ||
    !admin
  ) {
    return null;
  }

  return admin;
}