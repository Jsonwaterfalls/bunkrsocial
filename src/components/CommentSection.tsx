import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      content: newComment.trim(),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    refetchComments();
    toast({
      title: "Success",
      description: "Comment posted successfully!",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className="w-full sm:w-auto"
        >
          Post Comment
        </Button>
      </div>

      <div className="space-y-4">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg bg-muted/30 p-3 space-y-1"
          >
            <p className="text-sm">{comment.content}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at!), {
                addSuffix: true,
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};