import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
}

const notices: Notice[] = [
  {
    id: 1,
    title: "Notice 1",
    description: "Description for notice 1",
    date: "2023-10-01",
  },
  {
    id: 2,
    title: "Notice 2",
    description: "Description for notice 2",
    date: "2023-10-02",
  },
  // Add more notices here
];

const NoticeBoard: React.FC = () => {
  return (
    <div className="max-w-4xl p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Notice Board</h1>
      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="border rounded-lg shadow-lg">
            <CardHeader className="p-4 bg-card">
              <h2 className="text-xl font-semibold">{notice.title}</h2>
              <p className="text-sm text-foreground/50">{notice.date}</p>
            </CardHeader>
            <CardContent className="p-4">
              <p>{notice.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;
