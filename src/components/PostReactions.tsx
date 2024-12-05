import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ThumbsUp, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostReactionsProps {
  postId: string;
  userId: string | undefined;
}

export const PostReactions = ({ postId, userId }: PostReactionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reactions } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;
      return data;
    },
  });

  const hasLiked = reactions?.some(
    (reaction) => reaction.user_id === userId && reaction.type === "like"
  );
  const hasBookmarked = reactions?.some(
    (reaction) => reaction.user_id === userId && reaction.type === "bookmark"
  );

  const mutation = useMutation({
    mutationFn: async ({
      type,
      action,
    }: {
      type: "like" | "bookmark";
      action: "add" | "remove";
    }) => {
      if (action === "add") {
        const { error } = await supabase
          .from("post_reactions")
          .insert([{ post_id: postId, user_id: userId, type }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId)
          .eq("type", type);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", postId] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update reaction. Please try again.",
      });
      console.error("Reaction error:", error);
    },
  });

  const handleReaction = (type: "like" | "bookmark") => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to react to posts.",
      });
      return;
    }

    const isActive = type === "like" ? hasLiked : hasBookmarked;
    mutation.mutate({
      type,
      action: isActive ? "remove" : "add",
    });
  };

  const likeCount = reactions?.filter((r) => r.type === "like").length || 0;
  const bookmarkCount = reactions?.filter((r) => r.type === "bookmark").length || 0;

  return (
    <div className="flex gap-4">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${hasLiked ? "text-blue-500" : ""}`}
        onClick={() => handleReaction("like")}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{likeCount}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${hasBookmarked ? "text-yellow-500" : ""}`}
        onClick={() => handleReaction("bookmark")}
      >
        <Bookmark className="h-4 w-4" />
        <span>{bookmarkCount}</span>
      </Button>
    </div>
  );
};