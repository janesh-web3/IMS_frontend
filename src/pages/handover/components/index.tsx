import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import HandOverCreateForm from "./HandOverCreateForm";
import { HandOverTable } from "./Table";

export default function HandOverLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search HandOver Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            renderModal={(onClose) => <HandOverCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <HandOverTable/>
    </>

  );
}
