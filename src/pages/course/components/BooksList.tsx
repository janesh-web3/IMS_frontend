import { useEffect, useState } from "react";
import { crudRequest, moveToRecycleBin } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { AlertModal } from "@/components/shared/alert-modal";
import { toast } from "react-toastify";
import PopupModal from "@/components/shared/popup-modal";
import BookUpdateForm from "./BookUpdateForm";
import AdminComponent from "@/components/shared/AdminComponent";

interface Book {
  _id: string;
  name: string;
  price: number;
  bookType: string;
  isFree: boolean;
}

const BooksList = ({ courseId }: { courseId: string }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      const response = await crudRequest<{ success: boolean; data: Book[] }>(
        "GET",
        `/book/get-books/${courseId}`
      );
      if (response.success) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [courseId]);

  const onDelete = async () => {
    if (!bookToDelete) return;
    try {
      const success = await moveToRecycleBin("Book", bookToDelete);
      if (success) {
        setBooks((prev) => prev.filter((book) => book._id !== bookToDelete));
        toast.success("Book moved to recycle bin");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    } finally {
      setDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <AdminComponent>
              <TableHead>Actions</TableHead>
            </AdminComponent>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book._id}>
              <TableCell>{book.name}</TableCell>
              <TableCell>{book.bookType}</TableCell>
              <TableCell>
                {book.isFree ? "Free" : `Rs. ${book.price}`}
              </TableCell>
              <TableCell>{book.isFree ? "Free" : "Paid"}</TableCell>
              <AdminComponent>
                <TableCell>
                  <span className="px-2">
                    <PopupModal
                      text="Edit"
                      icon={<Edit className="w-4 h-4 mr-2" />}
                      renderModal={(onClose) => (
                        <BookUpdateForm
                          bookId={book._id}
                          initialData={{
                            name: book.name,
                            price: book.price,
                            bookType: book.bookType,
                            isFree: book.isFree,
                          }}
                          modalClose={() => {
                            onClose();
                            fetchBooks();
                          }}
                        />
                      )}
                    />
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeleteModalOpen(true);
                      setBookToDelete(book._id);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </AdminComponent>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={onDelete}
        loading={false}
        title="Delete Book"
        description="Are you sure you want to delete this book?"
      />
    </>
  );
};

export default BooksList;
