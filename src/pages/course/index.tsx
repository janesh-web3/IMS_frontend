import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import CourseLayout from "./components";

export default function CoursePage() {
  return (
    <div className="p-2">
      <PageHead title="Course | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Courses", link: "/course" },
        ]}
      />
      <div>
        <CourseLayout />
      </div>
    </div>
  );
}
