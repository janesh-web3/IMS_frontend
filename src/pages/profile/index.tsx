import { useAdminContext } from "@/context/adminContext";
import UserProfile from "./components/UserProfile";

const index = () => {
  const { adminDetails } = useAdminContext();
  return (
    <div>
      <UserProfile
        name={adminDetails?.username}
        role={adminDetails?.role}
        id={adminDetails._id}
      />
    </div>
  );
};

export default index;
