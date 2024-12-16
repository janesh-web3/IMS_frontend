import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { crudRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Question {
  _id: string;
  text: string;
  options: Array<{
    text: string;
    _id: string;
  }>;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timer: number;
  questions: Question[];
}

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (quiz?.timer) {
      setTimeLeft(quiz.timer * 60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      const response = (await crudRequest(
        "GET",
        `/quiz/get-quiz/${id}`
      )) as Quiz;
      setQuiz(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz",
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quiz?.questions.length) {
      toast({
        title: "Warning",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = (await crudRequest("POST", "/quiz/submit", {
        quizId: quiz?._id,
        answers,
        timeSpent: quiz!.timer * 60 - timeLeft,
      })) as { score: number };

      toast({
        title: "Success",
        description: `Quiz submitted! Your score: ${response.score}%`,
      });
      navigate("/quiz/results");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Time remaining: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </CardHeader>
        <CardContent>{quiz.description}</CardContent>
      </Card>

      {quiz.questions.map((question, index) => (
        <Card key={question._id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {index + 1}. {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question._id]}
              onValueChange={(value) => handleAnswerChange(question._id, value)}
            >
              {question.options.map((option) => (
                <div key={option._id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option._id} id={option._id} />
                  <Label htmlFor={option._id}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Quiz"
          )}
        </Button>
      </div>
    </div>
  );
}
