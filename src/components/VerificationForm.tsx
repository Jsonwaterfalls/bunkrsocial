import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VerificationFormProps {
  onVerify: (statement: string, results: any[]) => void;
}

export const VerificationForm = ({ onVerify }: VerificationFormProps) => {
  const [statement, setStatement] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerification = async () => {
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
      const response = await fetch('/functions/v1/verify-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          statement: statement.trim(),
          postId: post.id
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const { results } = await response.json();
      
      onVerify(statement, results);
      setStatement("");
      
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

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-navy mb-4">Verify a Statement</h2>
      <Textarea
        placeholder="Enter a statement to verify..."
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        className="min-h-[120px] mb-4"
      />
      <Button
        onClick={handleVerification}
        disabled={isVerifying}
        className="w-full bg-navy hover:bg-navy-light"
      >
        {isVerifying ? "Verifying..." : "Verify Statement"}
      </Button>
    </Card>
  );
};