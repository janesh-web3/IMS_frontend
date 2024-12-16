import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface QuizResult {
  quiz: {
    title: string;
    description: string;
  };
  score: number;
  timeSpent: number;
  submittedAt: string;
}

export default function QuizResults() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = (await crudRequest(
        "GET",
        "/quiz/my-results"
      )) as QuizResult[];
      setResults(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Quiz Results</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{result.quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Score: {result.score}%</p>
                <p>
                  Time Spent: {Math.floor(result.timeSpent / 60)}:
                  {(result.timeSpent % 60).toString().padStart(2, "0")}
                </p>
                <p>
                  Submitted: {new Date(result.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
