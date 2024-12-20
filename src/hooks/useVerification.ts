import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseVerificationResult {
  isVerifying: boolean;
  verifyStatement: (statement: string) => Promise<void>;
}

export const useVerification = (
  onVerify: (statement: string, results: any[]) => void
): UseVerificationResult => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const verifyStatement = async (statement: string) => {
    if (!statement.trim()) {
      toast({
        title: "Error",
        description: "Please enter a statement to verify",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to verify statements",
          variant: "destructive",
        });
        return;
      }

      // Create post first
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([
          { user_id: user.id, statement: statement.trim() }
        ])
        .select()
        .single();

      if (postError) {
        throw postError;
      }

      // Call verification function
      const { data, error } = await supabase.functions.invoke('verify-statement', {
        body: {
          statement: statement.trim(),
          postId: post.id
        },
      });

      if (error) throw error;
      
      onVerify(statement, data.results);
      
      toast({
        title: "Success",
        description: "Your statement has been verified",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to verify statement",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return { isVerifying, verifyStatement };
};