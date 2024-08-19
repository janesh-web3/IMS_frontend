import PageHead from "@/components/shared/page-head";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import StudentLayout from "./components";

export default function StudentPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Student Management | App" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Students", link: "/students" },
        ]}
      />
      <StudentLayout />
    </div>
  );
}
