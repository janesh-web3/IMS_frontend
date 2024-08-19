import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import StudentCreateForm from "./StudentCreateForm";
import { StudentTable } from "./Table";

export default function StudentLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5 overflow-y-auto">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Teacher Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            renderModal={(onClose) => (
              <StudentCreateForm modalClose={onClose} />
            )}
          />
        </div>
      </div>
      <StudentTable />
    </>
  );
}
