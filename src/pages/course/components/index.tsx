import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import CourseCreateForm from "./CourseCreateForm";
import { CourseTable } from "./Table";

export default function CourseLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Course Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            renderModal={(onClose) => <CourseCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <CourseTable />
    </>
  );
}
