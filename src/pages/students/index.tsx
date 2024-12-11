import PageHead from "@/components/shared/page-head";
import StudentLayout from "./components";

export default function StudentPage() {
  return (
    <div className="h-screen overflow-hidden">
      <PageHead title="Student Management | App" />
      <div className="h-[calc(100vh-2rem)] overflow-auto">
        <StudentLayout />
      </div>
    </div>
  );
}
