import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";

export default function QuizPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Quiz | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Quiz", link: "/quiz" },
        ]}
      />
    </div>
  );
}
