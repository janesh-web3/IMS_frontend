import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { crudRequest } from "@/lib/api";

interface QuestionFormProps {
  quizId: string;
  onQuestionAdded: () => void;
}

export default function QuestionForm({
  quizId,
  onQuestionAdded,
}: QuestionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState({
    text: "",
    explanation: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const addOption = () => {
    setQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }));
  };

  const removeOption = (index: number) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index
          ? { ...option, [field]: value }
          : field === "isCorrect" && value
            ? { ...option, isCorrect: false }
            : option
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!question.text.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    if (!question.options.some((option) => option.isCorrect)) {
      toast({
        title: "Error",
        description: "Please mark at least one option as correct",
        variant: "destructive",
      });
      return;
    }

    if (question.options.some((option) => !option.text.trim())) {
      toast({
        title: "Error",
        description: "All options must have text",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await crudRequest("POST", "/question/add-question", {
        ...question,
        quiz: quizId,
      });

      toast({
        title: "Success",
        description: "Question added successfully",
      });

      // Reset form
      setQuestion({
        text: "",
        explanation: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });

      onQuestionAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="questionText">Question Text</Label>
        <Textarea
          id="questionText"
          value={question.text}
          onChange={(e) => setQuestion({ ...question, text: e.target.value })}
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Options</Label>
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, "text", e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={option.isCorrect}
                onCheckedChange={(checked) =>
                  updateOption(index, "isCorrect", checked)
                }
              />
              <Label>Correct</Label>
            </div>
            {question.options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addOption}>
        <Plus className="w-4 h-4 mr-2" />
        Add Option
      </Button>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={question.explanation}
          onChange={(e) =>
            setQuestion({ ...question, explanation: e.target.value })
          }
          placeholder="Explain why the correct answer is correct..."
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding Question...
          </>
        ) : (
          "Add Question"
        )}
      </Button>
    </form>
  );
}
