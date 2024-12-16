import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { crudRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Option {
  _id: string;
  text: string;
}

interface Question {
  _id: string;
  text: string;
  options: Option[];
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      startQuiz();
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

  const startQuiz = async () => {
    try {
      const response = (await crudRequest(
        "GET",
        `/quiz/quiz/${id}/start`
      )) as Quiz;
      setQuiz(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive",
      });
      navigate("/quiz");
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
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

  const question = quiz.questions[currentQuestion];

  return (
    <div className="container p-4 mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Time remaining: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </CardHeader>
        <CardContent>{quiz.description}</CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[question._id]}
            onValueChange={(value) => handleAnswer(question._id, value)}
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

      <div className="flex justify-between mt-6">
        <Button onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>
        {currentQuestion === quiz.questions.length - 1 ? (
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
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </div>
  );
}
