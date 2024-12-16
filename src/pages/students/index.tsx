import PageHead from "@/components/shared/page-head";
import StudentLayout from "./components";

export default function StudentPage() {
  return (
    <div>
      <PageHead title="Student Management | App" />
      <div>
        <StudentLayout />
      </div>
    </div>
  );
}
