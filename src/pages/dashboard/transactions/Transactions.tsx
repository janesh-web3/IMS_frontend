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
import { Skeleton } from "@/components/ui/skeleton";

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
  const itemsPerPage = 10;

  // Separate loading states for different sections
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setSummaryLoading(true);

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
      setTransactionsLoading(false);
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, dateRange]);

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex justify-end">
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      {/* Summary Cards */}
      {summaryLoading && summaryLoading ? (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary && summary ? (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{summary?.totalCount}</div>
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
                {formatCurrency(summary?.totalAmount)}
              </div>
            </CardContent>
          </Card>
          {summary && summary.byReferenceModel && Object.entries(summary?.byReferenceModel).map(([model, data]) => (
            <Card key={model}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {model} Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{data?.count}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(data?.amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <>
              <div className="border rounded-md">
                {/* Table Header Skeleton */}
                <div className="border-b">
                  <div className="grid grid-cols-6 p-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-4 w-[100px]" />
                    ))}
                  </div>
                </div>

                {/* Table Body Skeleton */}
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-6 p-4 border-b last:border-0"
                    >
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <Skeleton key={j} className="h-4 w-[100px]" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Skeleton */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-[32px]" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-[32px]" />
                  ))}
                  <Skeleton className="h-8 w-[32px]" />
                </div>
              </div>
            </>
          ) : (
            <>
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
                  {transactions && transactions.map((transaction) => (
                    <TableRow key={transaction?.id}>
                      <TableCell>
                        {new Date(transaction?.date).toLocaleDateString(
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
                      <TableCell>{transaction?.description}</TableCell>
                      <TableCell>{transaction?.category}</TableCell>
                      <TableCell>
                        {transaction?.referenceModel} #{transaction?.referenceId}
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell
                        className={`text-right ${
                          transaction?.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction?.type === "expense" ? "-" : "+"}
                        {formatCurrency(transaction?.amount)}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
