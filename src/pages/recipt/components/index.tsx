import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import ReciptCreateForm from "./ReciptCreateForm";
import { ReciptTable } from "./Table";
import { Plus } from "lucide-react";

export default function ReciptLayout() {
  return (
    <div className="mb-40">
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Recipt Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            text="Add Recipt"
            icon={<Plus className="w-4 h-4 mr-2" />}
            renderModal={(onClose) => <ReciptCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <ReciptTable />
    </div>
  );
}
