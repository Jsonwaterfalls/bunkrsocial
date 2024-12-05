import { Card, CardContent, CardHeader } from "./ui/card";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    statement: string;
    created_at: string;
    verification_results: Array<{
      verdict: string;
      confidence: number;
      reasoning: string;
      model: string;
    }>;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "true":
        return "text-green-600";
      case "false":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg">{post.statement}</p>
        <div className="space-y-2">
          {post.verification_results?.map((result, index) => (
            <div
              key={index}
              className="rounded-lg bg-muted/50 p-3 text-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.model}</span>
                <span className={getVerdictColor(result.verdict)}>
                  {result.verdict.toUpperCase()} ({result.confidence}%)
                </span>
              </div>
              <p className="text-muted-foreground">{result.reasoning}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};