import PopupModal from "@/components/shared/popup-modal";
import TeacherCreateForm from "./TeacherCreateForm";
import { TeacherTable } from "./Table";
import { Plus } from "lucide-react";
import TeacherStats from "./TeacherStats";
import PremiumComponent from "@/components/shared/PremiumComponent";
import AdminComponent from "@/components/shared/AdminComponent";

export default function TeacherLayout() {
  return (
    <>
      <div className="flex flex-row-reverse items-center justify-between gap-2 py-5">
        {/* <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Teacher Here" />
        </div> */}
        <AdminComponent>
          <div className="flex gap-3">
            <PopupModal
              text="Add Teacher"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <TeacherCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
      <PremiumComponent>
        <AdminComponent>
          <TeacherStats />
        </AdminComponent>
      </PremiumComponent>

      <TeacherTable />
    </>
  );
}
