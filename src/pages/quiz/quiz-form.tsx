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
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { crudRequest } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionForm from "./question-form";

interface QuizFormProps {
  initialData?: any;
  onClose: () => void;
}

export default function QuizForm({
  initialData = null,
  onClose,
}: QuizFormProps) {
  const [quizData, setQuizData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    topic: initialData?.topic || "",
    category: initialData?.category || "",
    timer: initialData?.timer || 15,
  });
  const [useAI, setUseAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        await crudRequest("PUT", `/quiz/${initialData._id}`, quizData);
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
      } else if (useAI) {
        const prompt = `Create a quiz about ${quizData.topic} with 5 multiple choice questions`;
        await crudRequest("POST", "/quiz/generate-ai-quiz", {
          prompt,
          ...quizData,
        });
        toast({
          title: "Success",
          description: "AI Quiz generated successfully",
        });
      } else {
        await crudRequest("POST", "/quiz/add-quiz", quizData);
        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
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
          onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
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

      {!useAI && initialData && (
        <Tabs defaultValue="details" className="mt-6">
          <TabsList>
            <TabsTrigger value="details">Quiz Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            {/* Existing form fields */}
          </TabsContent>
          <TabsContent value="questions">
            <QuestionForm
              quizId={initialData._id}
              onQuestionAdded={() => {
                toast({
                  title: "Success",
                  description: "Question added successfully",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </form>
  );
}
