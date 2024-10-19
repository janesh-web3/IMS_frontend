import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import SubjectCreateForm from "./subject/CreateSubjectForm";
import { Subject } from "./subject";
import { Plus } from "lucide-react";

const CourseDetail = () => {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Course | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Courses", link: "/course" },
          { title: "Details", link: "/course" },
        ]}
      />

      <div>
        <div className="flex items-center justify-between gap-2 py-5">
          <div className="flex flex-1 gap-4">
            <TableSearchInput placeholder="Search Subject Here" />
          </div>
          <div className="flex gap-3">
            <PopupModal
              text="Add Subject"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <SubjectCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </div>
      </div>

      <Subject />
    </div>
  );
};

export default CourseDetail;
