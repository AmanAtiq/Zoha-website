import "./admin.css";
import AdminShell from "../../components/admin/AdminShell";

export const metadata = {
  title: "Admin — Zoha Asif",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
