import { useAdminContext } from "@/context/adminContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const index = () => {
  const { adminDetails } = useAdminContext();
  console.log(adminDetails.notifications);
  return (
    <div>
      <div className="p-4 rounded-lg shadow-md">
        <h2 className="mb-2 text-lg font-semibold">Notifications</h2>
        <ul>
          {adminDetails &&
            adminDetails.notifications.map((n, i) => (
              <li key={i}>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      {n.notificationId?.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      {n.notificationId?.message}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default index;
