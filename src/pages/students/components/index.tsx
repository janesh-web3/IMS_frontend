import { StudentTable } from "./Table";

export default function StudentLayout() {
  return (
    <div className="flex h-full overflow-auto">
      <div className="flex-1 overflow-auto">
        <StudentTable />
      </div>
    </div>
  );
}
