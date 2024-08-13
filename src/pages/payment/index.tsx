import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import PaymentLayout from "./components";

export default function PaymentPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Payment | Details" />
      <Breadcrumbs
        items={[
          { title: "Dashboard", link: "/" },
          { title: "Payment", link: "/payment" },
        ]}
      />
        <PaymentLayout/>
    </div>
  );
}
