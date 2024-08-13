import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import PaymentCreateForm from "./PaymentCreateForm";
import { PaymentTable } from "./Table";

export default function PaymentLayout() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search Payment Here" />
        </div>
        <div className="flex gap-3">
          <PopupModal
            renderModal={(onClose) => <PaymentCreateForm modalClose={onClose} />}
          />
        </div>
      </div>
      <PaymentTable/>
    </>
  );
}
