import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import HandOverLayout from "./components";

export default function HandOverPage() {

  return (
    <div className="p-4 md:p-8">
      <PageHead title="HandOver | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "HandOver", link: "/handover" },
        ]}
      />
       <HandOverLayout/>
    </div>
  );
}
