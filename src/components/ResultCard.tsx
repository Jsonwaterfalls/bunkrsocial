import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface LLMResult {
  model: string;
  confidence: number;
  reasoning: string;
  verdict: "true" | "false" | "uncertain";
}

interface ResultCardProps {
  statement: string;
  results: LLMResult[];
}

export const ResultCard = ({ statement, results }: ResultCardProps) => {
  const handleShare = () => {
    // TODO: Implement actual sharing logic
    console.log("Sharing results...");
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto mt-6 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-navy">Analysis Results</h3>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="text-sage hover:text-sage-light"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sage mb-6 italic">&quot;{statement}&quot;</p>
      
      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={index} className="border-b pb-4 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-navy">{result.model}</h4>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  result.verdict === "true"
                    ? "bg-green-100 text-green-800"
                    : result.verdict === "false"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {result.confidence}% confident
              </span>
            </div>
            <p className="text-sage-light text-sm">{result.reasoning}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};