import { VisitStudentTable } from "./Table";
import VisitStats from "./VisitStats";

const VisitLayout = () => {
  return (
    <div className="flex flex-col gap-4 py-10 mx-2 md:mx-4">
      <div className="px-2">
        <VisitStats />
      </div>
      <VisitStudentTable />
    </div>
  );
};

export default VisitLayout;
