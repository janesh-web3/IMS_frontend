import React from "react";
import { FileIcon, FileText } from "lucide-react";
import { Badge } from "./badge";

interface DocumentCountProps {
  count: number;
  onClick?: () => void;
}

export function DocumentCount({ count, onClick }: DocumentCountProps) {
  return (
    <div 
      className="flex items-center gap-1 cursor-pointer hover:text-primary" 
      onClick={onClick}
      title="Click to view documents"
    >
      <FileText size={16} className="text-muted-foreground" />
      <Badge variant={count > 0 ? "default" : "outline"}>
        {count} {count === 1 ? "document" : "documents"}
      </Badge>
    </div>
  );
} 