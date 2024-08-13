import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";

const SubjectDetails = () => {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Course | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Courses", link: "/course" },
          { title: "Subject", link: "/subject" },
          { title: "Details", link: "/details" },
        ]}
      />
    </div>
  );
};

export default SubjectDetails;
