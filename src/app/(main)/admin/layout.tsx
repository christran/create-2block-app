// import { DashboardNavbar } from "../_components/dashboard-navbar";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <>
      {children}
    </>
  );
}
