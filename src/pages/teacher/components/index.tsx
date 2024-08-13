import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import TeacherCreateForm from "./TeacherCreateForm";
import { TeacherTable } from "./Table";

export default function TeacherLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Teacher Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            renderModal={(onClose) => <TeacherCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <TeacherTable/>
    </>
  );
}
