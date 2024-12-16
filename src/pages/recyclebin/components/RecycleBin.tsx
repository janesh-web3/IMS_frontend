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
  bookType?: string;
  price?: number;
  isFree?: boolean;
}

type Column = {
  header: string;
  accessor: string | string[];
  render?: (value: any) => string;
};

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
    books: DeletedItem[];
    quizzes: DeletedItem[];
  }>({
    students: [],
    faculty: [],
    courses: [],
    subjects: [],
    payments: [],
    visits: [],
    handovers: [],
    recipts: [],
    books: [],
    quizzes: [],
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
        books: DeletedItem[];
        quizzes: DeletedItem[];
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
    columns: Column[],
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
                      : column.accessor === "isFree"
                        ? item.isFree
                          ? "Free"
                          : "Paid"
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
    <div className="px-1 py-2 md:container md:mx-auto md:py-6">
      <DeleteConfirmDialog />
      <Card>
        <CardHeader>
          <CardTitle>Recycle Bin</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid grid-cols-2 gap-2 mb-4 md:flex md:flex-wrap">
              <TabsTrigger value="students" className="w-full md:w-auto">
                Students
              </TabsTrigger>
              <TabsTrigger value="faculty" className="w-full md:w-auto">
                Faculty
              </TabsTrigger>
              <TabsTrigger value="courses" className="w-full md:w-auto">
                Courses
              </TabsTrigger>
              <TabsTrigger value="subjects" className="w-full md:w-auto">
                Subjects
              </TabsTrigger>
              <TabsTrigger value="payments" className="w-full md:w-auto">
                Payments
              </TabsTrigger>
              <TabsTrigger value="visits" className="w-full md:w-auto">
                Visits
              </TabsTrigger>
              <TabsTrigger value="handovers" className="w-full md:w-auto">
                Handovers
              </TabsTrigger>
              <TabsTrigger value="recipts" className="w-full md:w-auto">
                Recipts
              </TabsTrigger>
              <TabsTrigger value="books" className="w-full md:w-auto">
                Books
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="w-full md:w-auto">
                Quizzes
              </TabsTrigger>
            </TabsList>

            <div className="mt-36 md:mt-0 overflow-y-auto max-h-[calc(100vh-400px)]">
              <TabsContent value="students" className="mt-0">
                {renderTable(
                  deletedItems?.students,
                  [
                    { header: "ID", accessor: "_id" },
                    {
                      header: "Name",
                      accessor: ["personalInfo", "studentName"],
                    },
                  ],
                  "student"
                )}
              </TabsContent>

              <TabsContent value="faculty" className="mt-0">
                {renderTable(
                  deletedItems?.faculty,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                  ],
                  "faculty"
                )}
              </TabsContent>

              <TabsContent value="courses" className="mt-0">
                {renderTable(
                  deletedItems?.courses,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                  ],
                  "course"
                )}
              </TabsContent>

              <TabsContent value="subjects" className="mt-0">
                {renderTable(
                  deletedItems?.subjects,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "subjectName" },
                  ],
                  "subject"
                )}
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                {renderTable(
                  deletedItems?.payments,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Expense", accessor: "expense" },
                    { header: "Amount", accessor: "amount" },
                    { header: "Date", accessor: "createdAt" },
                  ],
                  "payment"
                )}
              </TabsContent>

              <TabsContent value="visits" className="mt-0">
                {renderTable(
                  deletedItems?.visits,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Student Name", accessor: "studentName" },
                    { header: "Visit Date", accessor: "dateOfVisit" },
                  ],
                  "visit"
                )}
              </TabsContent>

              <TabsContent value="handovers" className="mt-0">
                {renderTable(
                  deletedItems?.handovers,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                  ],
                  "handover"
                )}
              </TabsContent>

              <TabsContent value="recipts" className="mt-0">
                {renderTable(
                  deletedItems?.recipts,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Income", accessor: "income" },
                  ],
                  "recipt"
                )}
              </TabsContent>

              <TabsContent value="books" className="mt-0">
                {renderTable(
                  deletedItems?.books,
                  [
                    { header: "ID", accessor: "_id" },
                    { header: "Name", accessor: "name" },
                    { header: "Type", accessor: "bookType" },
                    { header: "Price", accessor: "price" },
                    {
                      header: "Status",
                      accessor: "isFree",
                      render: (value: boolean) => (value ? "Free" : "Paid"),
                    },
                  ],
                  "book"
                )}
              </TabsContent>

              <TabsContent value="quizzes" className="mt-0">
                {renderTable(
                  deletedItems?.quizzes,
                  [{ header: "ID", accessor: "_id" }],
                  "quiz"
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
