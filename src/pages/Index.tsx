import { VerificationForm } from "@/components/VerificationForm";
import { ResultCard } from "@/components/ResultCard";
import { TrendingTopics } from "@/components/TrendingTopics";
import { useState } from "react";

// Mock results - would be replaced with real API calls
const mockResults = [
  {
    model: "GPT-4",
    confidence: 92,
    reasoning: "Based on multiple reliable sources and scientific consensus...",
    verdict: "true" as const,
  },
  {
    model: "Claude",
    confidence: 88,
    reasoning: "According to peer-reviewed research and expert opinions...",
    verdict: "true" as const,
  },
  {
    model: "PaLM",
    confidence: 85,
    reasoning: "Evidence from credible institutions supports this claim...",
    verdict: "true" as const,
  },
];

const Index = () => {
  const [currentStatement, setCurrentStatement] = useState("");
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">Bunkr</h1>
          <p className="text-sage-light text-lg">
            Verify facts, combat misinformation, share truth.
          </p>
        </div>

        <VerificationForm />
        {showResults && <ResultCard statement={currentStatement} results={mockResults} />}
        <TrendingTopics />
      </div>
    </div>
  );
};

export default Index;