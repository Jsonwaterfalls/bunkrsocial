import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "./CommentSection";
import { PostReactions } from "./PostReactions";
import { supabase } from "@/integrations/supabase/client";

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
  const [showComments, setShowComments] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get the current user on component mount
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

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
    <Card className="w-full animate-fadeIn">
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
      <CardFooter className="flex flex-col items-stretch gap-4">
        <div className="flex justify-between items-center">
          <PostReactions postId={post.id} userId={user?.id} />
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            Comments
          </Button>
        </div>
        {showComments && <CommentSection postId={post.id} />}
      </CardFooter>
    </Card>
  );
};