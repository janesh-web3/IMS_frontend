import { useAdminContext } from "@/context/adminContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { adminDetails, markNotificationAsRead, fetchAdminDetails } =
    useAdminContext();

  return (
    <div className="w-full h-screen">
      <div className="w-full h-full p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <Button variant="outline" onClick={fetchAdminDetails}>
            Refresh
          </Button>
        </div>
        <div className="w-full overflow-y-auto max-h-[90vh] pb-16">
          <div className="min-w-[800px]">
            {adminDetails &&
              adminDetails.notifications.map((n, i) => (
                <Accordion
                  type="single"
                  collapsible
                  className={`ml-auto w-full text-sm font-medium ${
                    n.isRead ? "bg-accent" : "bg-background"
                  }`}
                  key={i}
                >
                  <AccordionItem value={`item-${i}`}>
                    <AccordionTrigger
                      className={`ml-auto text-sm font-medium p-4 hover:no-underline ${
                        n.isRead ? "bg-accent" : "bg-background"
                      }`}
                      onClick={() =>
                        !n.isRead &&
                        markNotificationAsRead(n.notificationId._id)
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          {n.notificationId?.title}
                          <span className="ml-2 text-sm font-thin">
                            {new Date(
                              n.notificationId?.createdAt
                            ).toDateString()}{" "}
                            &nbsp; &nbsp;
                            {new Date(
                              n.notificationId?.createdAt
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-sm font-thin">
                          {n.isRead ? (
                            <Button variant="outline">Read</Button>
                          ) : (
                            <Button variant="default">Unread</Button>
                          )}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5">
                      {n.notificationId?.message}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
