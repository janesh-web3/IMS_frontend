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
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: "",
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
      await crudRequest("PUT", `/recycle/restore/${type}/${id}`);
      toast.success(`${type} restored successfully`);
      fetchDeletedItems();
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error(`Failed to restore ${type}`);
    }
  };

  const handlePermanentDelete = async (id: string, type: string) => {
    setDeleteDialog({ isOpen: true, itemId: id, itemType: type });
  };

  const confirmDelete = async () => {
    try {
      await crudRequest(
        "DELETE",
        `/recycle/delete/${deleteDialog.itemType}/${deleteDialog.itemId}`
      );
      toast.success(`${deleteDialog.itemType} permanently deleted`);
      fetchDeletedItems();
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      toast.error(`Failed to delete ${deleteDialog.itemType}`);
    } finally {
      setDeleteDialog({ isOpen: false, itemId: "", itemType: "" });
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

  const DeleteConfirmDialog = () => (
    <AlertDialog
      open={deleteDialog.isOpen}
      onOpenChange={(isOpen) =>
        setDeleteDialog({ isOpen, itemId: "", itemType: "" })
      }
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this item
            from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="container py-6 mx-auto">
      <DeleteConfirmDialog />
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
                  "course"
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
