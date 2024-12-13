import { formatCurrency } from "@/lib/utils";

interface BillData {
  title: string;
  date?: string;
  billNo?: string | number;
  recipientName: string;
  amount: number;
  paymentMethod: string;
  description: string;
  type: "fee" | "salary" | "receipt" | "payment";
  additionalDetails?: {
    label: string;
    value: string | number;
  }[];
}

export const generateBill = (data: BillData) => {
  const billHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .bill-container { 
          max-width: 400px; 
          margin: 0 auto; 
          padding: 20px;
          border: 1px solid #ccc;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .bill-details { 
          margin-bottom: 20px; 
          padding: 10px;
          background-color: #f9f9f9;
        }
        .bill-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 10px 0;
          padding: 5px 0;
          border-bottom: 1px dashed #ccc;
        }
        .footer { 
          margin-top: 30px; 
          text-align: center;
          border-top: 2px solid #333;
          padding-top: 10px;
        }
        @media print {
          .no-print { display: none; }
          body { margin: 0; }
          .bill-container { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="header">
          <h2>${data.title}</h2>
          <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="bill-details">
          ${
            data.billNo
              ? `
          <div class="bill-row">
            <strong>Bill No:</strong>
            <span>${data.billNo}</span>
          </div>
          `
              : ""
          }
          
          <div class="bill-row">
            <strong>${data.type === "salary" ? "Teacher Name" : "Name"}:</strong>
            <span>${data.recipientName}</span>
          </div>

          <div class="bill-row">
            <strong>Amount:</strong>
            <span>${formatCurrency(data.amount)}</span>
          </div>

          <div class="bill-row">
            <strong>Payment Method:</strong>
            <span>${data.paymentMethod}</span>
          </div>

          <div class="bill-row">
            <strong>Description:</strong>
            <span>${data.description}</span>
          </div>

          ${
            data.additionalDetails
              ?.map(
                (detail) => `
            <div class="bill-row">
              <strong>${detail.label}:</strong>
              <span>${detail.value}</span>
            </div>
          `
              )
              .join("") || ""
          }
        </div>
        
        <div class="footer">
          <p>Thank you!</p>
          <p>This is a computer generated receipt.</p>
        </div>
      </div>
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">Print Receipt</button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.onload = function () {
      printWindow.print();
    };
  }
};
