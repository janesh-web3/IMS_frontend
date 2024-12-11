import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import CourseCreateForm from "./CourseCreateForm";
import { CourseTable } from "./Table";
import { Plus } from "lucide-react";
import CourseStats from "./CourseStats";

export default function CourseLayout() {
  return (
    <>
      <CourseStats />
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Course Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            text="Add Course"
            icon={<Plus className="w-4 h-4 mr-2" />}
            renderModal={(onClose) => <CourseCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <CourseTable />
    </>
  );
}
