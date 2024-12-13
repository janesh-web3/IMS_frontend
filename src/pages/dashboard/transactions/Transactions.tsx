import { useEffect, useState } from "react";
import { crudRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../accounting/components/DateRangePicker";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  paymentMethod: string;
  referenceModel: string;
  referenceId: string;
}

interface TransactionSummary {
  totalCount: number;
  totalAmount: number;
  byReferenceModel: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await crudRequest<{
        data: Transaction[];
        summary: TransactionSummary;
        totalPages: number;
      }>("GET", `/daybook/transactions`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString(),
        },
      });

      setTransactions(response.data);
      setSummary(response.summary);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, dateRange]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div>Loading transactions...</div>
      ) : (
        <>
          {/* Date Range Filter */}
          <div className="flex justify-end">
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{summary.totalCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {formatCurrency(summary.totalAmount)}
                  </div>
                </CardContent>
              </Card>
              {Object.entries(summary.byReferenceModel).map(([model, data]) => (
                <Card key={model}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {model} Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{data.count}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(data.amount)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        {transaction.referenceModel} #{transaction.referenceId}
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell
                        className={`text-right ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "expense" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 && setCurrentPage((p) => p - 1)
                        }
                        aria-disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages &&
                          setCurrentPage((p) => p + 1)
                        }
                        aria-disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
