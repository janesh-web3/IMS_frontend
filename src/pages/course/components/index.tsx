import { CourseTable } from "./Table";

export default function CourseLayout() {
  return (
    <>
      <div className="flex h-full">
        <div className="flex-1 p-2">
          <CourseTable />
        </div>
      </div>
    </>
  );
}
