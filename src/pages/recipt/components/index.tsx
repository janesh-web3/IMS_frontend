import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import ReciptCreateForm from "./ReciptCreateForm";
import { ReciptTable } from "./Table";

export default function ReciptLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Recipt Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            renderModal={(onClose) => <ReciptCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <ReciptTable/>
    </>
  );
}
