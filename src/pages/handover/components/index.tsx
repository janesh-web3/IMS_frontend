import PopupModal from "@/components/shared/popup-modal";
import TableSearchInput from "@/components/shared/table-search-input";
import HandOverCreateForm from "./HandOverCreateForm";
import { HandOverTable } from "./Table";
import { Plus } from "lucide-react";
import HandOverStats from "./HandOverStats";
import PremiumComponent from "@/components/shared/PremiumComponent";
import AdminComponent from "@/components/shared/AdminComponent";

export default function HandOverLayout() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="flex flex-1 gap-4">
          <TableSearchInput placeholder="Search HandOver Here" />
        </div>
        <AdminComponent>
          <div className="flex gap-3">
            <PopupModal
              text="Add Payment"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <HandOverCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
      <PremiumComponent>
        <AdminComponent>
          <HandOverStats />
        </AdminComponent>
      </PremiumComponent>

      <HandOverTable />
    </div>
  );
}
