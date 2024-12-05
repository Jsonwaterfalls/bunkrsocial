import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useVerification } from "@/hooks/useVerification";

interface VerificationFormProps {
  onVerify: (statement: string, results: any[]) => void;
}

export const VerificationForm = ({ onVerify }: VerificationFormProps) => {
  const [statement, setStatement] = useState("");
  const { isVerifying, verifyStatement } = useVerification(onVerify);

  const handleVerification = async () => {
    await verifyStatement(statement);
    setStatement("");
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#0cc0df] mb-4">Verify a Statement</h2>
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