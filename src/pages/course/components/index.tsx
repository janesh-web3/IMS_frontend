import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import CourseCreateForm from "./CourseCreateForm";
import { CourseTable } from "./Table";
import { Plus } from "lucide-react";
import CourseStats from "./CourseStats";
import PremiumComponent from "@/components/shared/PremiumComponent";
import AdminComponent from "@/components/shared/AdminComponent";

export default function CourseLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Course Here" />
        </div>
        <AdminComponent>
          <div className="flex gap-3">
            <PopupModal
              text="Add Course"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <CourseCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
      <PremiumComponent>
        <AdminComponent>
          <CourseStats />
        </AdminComponent>
      </PremiumComponent>
      <CourseTable />
    </>
  );
}
