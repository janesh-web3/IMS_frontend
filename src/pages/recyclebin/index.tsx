import Heading from "@/components/shared/heading";
import RecycleBin from "./components/RecycleBin";

const index = () => {
  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col max-w-screen-xl gap-4 mx-auto max-h-[calc(100vh-100px)]">
        <Heading
          title={"Recycle Bin"}
          description={""}
          className="py-4 space-y-2 text-center"
        />
        <RecycleBin />
      </div>
    </div>
  );
};

export default index;
