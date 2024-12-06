import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { crudRequest } from "@/lib/api";

interface DeletedItem {
  _id: string;
  name?: string;
  studentName?: string;
  personalInfo?: {
    studentName: string;
  };
  subjectName?: string;
  expense?: string;
  amount?: number;
  dateOfVisit?: string;
  createdAt?: string;
}

const RecycleBin = () => {
  const [deletedItems, setDeletedItems] = useState<{
    students: DeletedItem[];
    faculty: DeletedItem[];
    courses: DeletedItem[];
    subjects: DeletedItem[];
    payments: DeletedItem[];
    visits: DeletedItem[];
    handovers: DeletedItem[];
    recipts: DeletedItem[];
  }>({
    students: [],
    faculty: [],
    courses: [],
    subjects: [],
    payments: [],
    visits: [],
    handovers: [],
    recipts: [],
  });

  const fetchDeletedItems = async () => {
    try {
      type DeletedItemsResponse = {
        students: DeletedItem[];
        faculty: DeletedItem[];
        courses: DeletedItem[];
        subjects: DeletedItem[];
        payments: DeletedItem[];
        visits: DeletedItem[];
        handovers: DeletedItem[];
        recipts: DeletedItem[];
      };
      const response = await crudRequest<DeletedItemsResponse>(
        "GET",
        "/recycle/items"
      );
      setDeletedItems(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRestore = async (id: string, type: string) => {
    try {
      await crudRequest("POST", `/recycle/restore/${type}/${id}`);
      // Refresh the list after restore
      fetchDeletedItems();
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const handlePermanentDelete = async (id: string, type: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await crudRequest("DELETE", `/recycle/permanent-delete/${type}/${id}`);
      // Refresh the list after delete
      fetchDeletedItems();
    } catch (error) {
      console.error("Error permanently deleting item:", error);
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const renderTable = (
    items: DeletedItem[],
    columns: { header: string; accessor: string | string[] }[],
    type: string
  ) => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items &&
            items.map((item) => (
              <TableRow key={item._id}>
                {columns.map((column, index) => (
                  <TableCell key={index}>
                    {Array.isArray(column.accessor)
                      ? column.accessor.reduce(
                          (obj: any, key) => obj?.[key],
                          item
                        )
                      : item[column.accessor as keyof DeletedItem]}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleRestore(item._id, type)}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handlePermanentDelete(item._id, type)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container py-6 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Recycle Bin</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="flex flex-wrap gap-2 mb-4">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="visits">Visits</TabsTrigger>
              <TabsTrigger value="handovers">Handovers</TabsTrigger>
              <TabsTrigger value="recipts">Recipts</TabsTrigger>
            </TabsList>

            <div className="mt-20 md:mt-4 overflow-y-auto max-h-[calc(100vh-300px)]">
              <TabsContent value="students">
                {renderTable(
                  deletedItems?.students,
                  [
                    { header: "ID", accessor: "_id" },
                    {
                      header: "Name",
                      accessor: ["personalInfo", "studentName"],
                    },
                  ],
                  "students"
                )}
              </TabsContent>

              <TabsContent value="faculty">
                {renderTable(
                  deletedItems?.faculty,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                  ],
                  "faculty"
                )}
              </TabsContent>

              <TabsContent value="courses">
                {renderTable(
                  deletedItems?.courses,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                  ],
                  "courses"
                )}
              </TabsContent>

              <TabsContent value="subjects">
                {renderTable(
                  deletedItems?.subjects,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "subjectName" },
                  ],
                  "subjects"
                )}
              </TabsContent>

              <TabsContent value="payments">
                {renderTable(
                  deletedItems?.payments,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Expense", accessor: "expense" },
                    { header: "Amount", accessor: "amount" },
                    { header: "Date", accessor: "createdAt" },
                  ],
                  "payments"
                )}
              </TabsContent>

              <TabsContent value="visits">
                {renderTable(
                  deletedItems?.visits,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Student Name", accessor: "studentName" },
                    { header: "Visit Date", accessor: "dateOfVisit" },
                  ],
                  "visits"
                )}
              </TabsContent>

              <TabsContent value="handovers">
                {renderTable(
                  deletedItems?.handovers,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                  ],
                  "handovers"
                )}
              </TabsContent>

              <TabsContent value="recipts">
                {renderTable(
                  deletedItems?.recipts,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Income", accessor: "income" },
                  ],
                  "recipts"
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecycleBin;
