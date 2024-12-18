import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import PageHead from "@/components/shared/page-head";
import { crudRequest, moveToRecycleBin } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QuizForm from "./quiz-form"; // We'll create this component next
import AdminComponent from "@/components/shared/AdminComponent";
import PremiumComponent from "@/components/shared/PremiumComponent";
import StudentComponent from "@/components/shared/StudentComponent";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  topic: string;
  category: string;
  timer: number;
  isAIGenerated?: boolean;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({
    isOpen: false,
    quizId: null,
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = (await crudRequest("GET", "/quiz/get-quiz")) as Quiz[];
      setQuizzes(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirmation = (quizId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      quizId,
    });
  };

  const handleDelete = async (quizId: string) => {
    try {
      const success = await moveToRecycleBin("Quiz", quizId);
      if (success) {
        setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
        toast({
          title: "Success",
          description: "Quiz moved to recycle bin",
        });
        fetchQuizzes();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, quizId: null });
    }
  };

  const handleModalClose = () => {
    setSelectedQuiz(null);
    setIsModalOpen(false);
    fetchQuizzes();
  };

  return (
    <div className="flex flex-col bg-background">
      <div className="sticky top-0 z-20 border-b bg-background">
        <div className="p-4 md:p-6">
          <PageHead title="Quizzes" />
          <Breadcrumbs
            items={[
              { title: "Dashboard", link: "/" },
              { title: "Quizzes", link: "/quiz" },
            ]}
          />
        </div>
      </div>

      <PremiumComponent>
        <AdminComponent>
          <div className="flex-1 mb-10">
            <div className="container p-4 mx-auto md:p-6">
              <div className="sticky z-10 py-2 top-4 bg-background">
                <Dialog
                  open={isModalOpen}
                  onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) handleModalClose();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] h-[500px] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedQuiz ? "Edit Quiz" : "Create New Quiz"}
                      </DialogTitle>
                    </DialogHeader>
                    <QuizForm
                      initialData={selectedQuiz}
                      onClose={handleModalClose}
                      onSuccess={() => {
                        fetchQuizzes();
                      }}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={deleteConfirmation.isOpen}
                  onOpenChange={(isOpen) =>
                    setDeleteConfirmation({ isOpen, quizId: null })
                  }
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        Are you sure you want to move this quiz to the recycle
                        bin?
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setDeleteConfirmation({ isOpen: false, quizId: null })
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          deleteConfirmation.quizId &&
                          handleDelete(deleteConfirmation.quizId)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  <div className="flex items-center justify-center col-span-full">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  quizzes.map((quiz) => (
                    <Card key={quiz._id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xl">
                          {quiz.title}
                          {quiz.isAIGenerated && (
                            <Bot className="inline-block w-4 h-4 ml-2 text-blue-500" />
                          )}
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteConfirmation(quiz._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Category:</span>{" "}
                            {quiz.category}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Topic:</span>{" "}
                            {quiz.topic}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Timer:</span>{" "}
                            {quiz.timer} minutes
                          </div>
                        </div>
                        {/* <Button
                      onClick={() => router.push(`/quiz/take/${quiz._id}`)}
                      className="mt-4"
                    >
                      Take Quiz
                    </Button> */}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </AdminComponent>
        <StudentComponent>
          <div>Student quiz</div>
        </StudentComponent>
      </PremiumComponent>
    </div>
  );
}
