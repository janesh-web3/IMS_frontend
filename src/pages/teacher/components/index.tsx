import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import TeacherCreateForm from "./TeacherCreateForm";
import { TeacherTable } from "./Table";
import { Plus } from "lucide-react";
import TeacherStats from "./TeacherStats";

export default function TeacherLayout() {
  return (
    <>
      <TeacherStats />
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Teacher Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            text="Add Teacher"
            icon={<Plus className="w-4 h-4 mr-2" />}
            renderModal={(onClose) => (
              <TeacherCreateForm modalClose={onClose} />
            )}
          />
        </div>
      </div>
      <TeacherTable />
    </>
  );
}
