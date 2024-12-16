import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { crudRequest } from "@/lib/api";
import { Question } from "@/types/quiz";
import { toast } from "react-toastify";

interface QuestionFormProps {
  quizId: string;
  onQuestionAdded: (question: Question) => void;
  questionToEdit?: Question | null;
  onQuestionUpdated?: (question: Question) => void;
  onCancelEdit?: () => void;
}

interface FormOption {
  text: string;
  isCorrect: boolean;
}

export default function QuestionForm({
  quizId,
  onQuestionAdded,
  questionToEdit = null,
  onQuestionUpdated,
  onCancelEdit,
}: QuestionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState<{
    text: string;
    explanation: string;
    options: FormOption[];
  }>({
    text: questionToEdit?.text || "",
    explanation: questionToEdit?.explanation || "",
    options: questionToEdit?.options.map((opt) => ({
      text: opt.text,
      isCorrect: opt.isCorrect || false,
    })) || [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (questionToEdit && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [questionToEdit]);

  useEffect(() => {
    if (questionToEdit) {
      setQuestion({
        text: questionToEdit.text,
        explanation: questionToEdit.explanation || "",
        options: questionToEdit.options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect || false,
        })),
      });
    }
  }, [questionToEdit]);

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
    setIsLoading(true);

    try {
      if (questionToEdit) {
        const updatedQuestion = (await crudRequest(
          "PUT",
          `/quiz/question/${questionToEdit._id}`,
          question
        )) as Question;
        toast.success("Question updated successfully");
        onQuestionUpdated?.(updatedQuestion);
      } else {
        const newQuestion = (await crudRequest("POST", "/quiz/add-question", {
          ...question,
          quizId,
        })) as Question;
        toast.success("Question added successfully");
        onQuestionAdded(newQuestion);
      }

      if (!questionToEdit) {
        // Only reset form for new questions
        setQuestion({
          text: "",
          explanation: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });
      }
    } catch (error) {
      toast.error("Failed to save question");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuestion({
      text: "",
      explanation: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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

      <div className="flex justify-end space-x-2">
        {questionToEdit && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {questionToEdit ? "Updating..." : "Adding..."}
            </>
          ) : questionToEdit ? (
            "Update Question"
          ) : (
            "Add Question"
          )}
        </Button>
      </div>
    </form>
  );
}
