import type {
  ReactNode,
} from "react";

import AdminRouteGuard from "@/components/admin/AdminRouteGuard";


type Props = {
  children: ReactNode;
};


export default function AdminLayout({
  children,
}: Props) {
  return (
    <AdminRouteGuard>
      {children}
    </AdminRouteGuard>
  );
}