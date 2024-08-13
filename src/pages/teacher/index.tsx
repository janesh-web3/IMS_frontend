import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import TeacherLayout from "./components";

export default function TeacherPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Teacher | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Teachers", link: "/teacher" },
        ]}
      />
      <TeacherLayout />
    </div>
  );
}
