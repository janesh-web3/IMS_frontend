import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import ReciptLayout from "./components";

export default function ReciptPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Recipt | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Recipts", link: "/recipt" },
        ]}
      />
      <ReciptLayout />
    </div>
  );
}
