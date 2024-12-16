import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { crudRequest } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionForm from "./question-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question, Quiz } from "@/types/quiz";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";

interface QuizFormProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuizForm({
  initialData = null,
  onClose,
  onSuccess,
}: QuizFormProps) {
  const [quizData, setQuizData] = useState<{
    _id?: string;
    title: string;
    description: string;
    topic: string;
    category: string;
    timer: number;
  }>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    topic: initialData?.topic || "",
    category: initialData?.category || "",
    timer: initialData?.timer || 15,
  });
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );
  const [activeTab, setActiveTab] = useState("details");
  const [useAI, setUseAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        await crudRequest("PUT", `/quiz/${initialData._id}`, {
          ...quizData,
          questions: questions.map((q) => q._id),
        });
        toast.success("Quiz updated successfully");
      } else {
        const response = (await crudRequest("POST", "/quiz/add-quiz", {
          ...quizData,
          questions: [],
        })) as { _id: string };

        if (response._id) {
          setActiveTab("questions");
          setQuizData((prev) => ({ ...prev, _id: response._id }));
        }
        toast.success("Quiz created successfully. Now add questions.");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshQuestions = async () => {
    const quizId = initialData?._id || quizData._id;
    if (quizId) {
      try {
        const quiz = (await crudRequest(
          "GET",
          `/quiz/get-quiz/${quizId}`
        )) as Quiz;
        setQuestions(quiz.questions);
      } catch (error) {
        console.error("Failed to refresh questions:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          {(initialData || activeTab === "questions") && (
            <TabsTrigger value="questions">Questions</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!initialData && (
              <div className="flex items-center justify-end space-x-2">
                <Switch id="useAI" checked={useAI} onCheckedChange={setUseAI} />
                <Label htmlFor="useAI">Use AI to generate quiz</Label>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={quizData.title}
                onChange={(e) =>
                  setQuizData({ ...quizData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quizData.description}
                onChange={(e) =>
                  setQuizData({ ...quizData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={quizData.topic}
                onChange={(e) =>
                  setQuizData({ ...quizData, topic: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={quizData.category}
                onValueChange={(value) =>
                  setQuizData({ ...quizData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer">Timer (minutes)</Label>
              <Input
                id="timer"
                type="number"
                min="1"
                value={quizData.timer}
                onChange={(e) =>
                  setQuizData({ ...quizData, timer: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {initialData
                      ? "Updating..."
                      : useAI
                        ? "Generating..."
                        : "Creating..."}
                  </>
                ) : initialData ? (
                  "Update Quiz"
                ) : useAI ? (
                  "Generate Quiz"
                ) : (
                  "Create Quiz"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="questions">
          <QuestionForm
            quizId={initialData?._id || quizData._id}
            questionToEdit={editingQuestion}
            onQuestionAdded={(newQuestion) => {
              setQuestions((prev) => [...prev, newQuestion]);
              refreshQuestions();
            }}
            onQuestionUpdated={(updatedQuestion) => {
              setQuestions((prev) =>
                prev.map((q) =>
                  q._id === updatedQuestion._id ? updatedQuestion : q
                )
              );
              setEditingQuestion(null);
            }}
            onCancelEdit={() => setEditingQuestion(null)}
          />

          {questions.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium">Added Questions</h3>
              {questions.map((question, index) => (
                <Card key={question._id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-base">
                        {index + 1}. {question.text}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={option._id}
                          className={`p-2 rounded ${
                            option.isCorrect ? "bg-primary/40" : ""
                          }`}
                        >
                          {optIndex + 1}. {option.text}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
