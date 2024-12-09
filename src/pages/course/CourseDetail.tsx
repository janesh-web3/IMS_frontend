import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import SubjectCreateForm from "./subject/CreateSubjectForm";
import { Subject } from "./subject";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import BooksList from "./components/BooksList";
import BookCreateForm from "./components/BookCreateForm";

const CourseDetail = () => {
  const { id } = useParams();

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
            <TableSearchInput placeholder="Search Subject/Book Here" />
          </div>
          <div className="flex gap-3">
            <PopupModal
              text="Add Subject"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <SubjectCreateForm modalClose={onClose} />
              )}
            />
            <PopupModal
              text="Add Book"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <BookCreateForm courseId={id!} modalClose={onClose} />
              )}
            />
          </div>
        </div>
      </div>

      <Subject />

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Course Books</h2>
        <BooksList courseId={id!} />
      </div>
    </div>
  );
};

export default CourseDetail;
