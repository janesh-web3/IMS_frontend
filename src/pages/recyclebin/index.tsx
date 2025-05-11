import Heading from "@/components/shared/heading";
import RecycleBin from "./components/RecycleBin";

const RecycleBinPage = () => {
  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col max-w-screen-xl md:gap-2 mx-auto max-h-[calc(100vh-100px)]">
        <Heading
          title="Recycle Bin"
          description=""
          className="text-center md:pt-2 md:space-y-2"
        />
        <RecycleBin />
      </div>
    </div>
  );
};

export default RecycleBinPage;
