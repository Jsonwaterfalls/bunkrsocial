import { VerificationForm } from "@/components/VerificationForm";
import { ResultCard } from "@/components/ResultCard";
import { TrendingTopics } from "@/components/TrendingTopics";
import { useState } from "react";

// Simulated verification function - in a real app, this would call actual LLM APIs
const verifyStatement = async (statement: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return [
    {
      model: "GPT-4",
      confidence: Math.floor(Math.random() * 30) + 70, // Random confidence between 70-99
      reasoning: "Based on cross-referencing multiple reliable sources including academic papers, government databases, and expert opinions, this statement appears to be verifiable. The key points align with established research findings and current scientific consensus.",
      verdict: Math.random() > 0.5 ? "true" : "false" as const,
    },
    {
      model: "Claude",
      confidence: Math.floor(Math.random() * 30) + 70,
      reasoning: "After analyzing recent peer-reviewed studies, official statistics, and expert commentary, the evidence strongly supports this claim. Multiple independent sources corroborate the main assertions.",
      verdict: Math.random() > 0.5 ? "true" : "false" as const,
    },
    {
      model: "PaLM",
      confidence: Math.floor(Math.random() * 30) + 70,
      reasoning: "Evaluation of credible sources, including academic publications, industry reports, and expert analyses, indicates this statement is supported by substantial evidence. The claims align with verified data points and expert consensus.",
      verdict: Math.random() > 0.5 ? "true" : "false" as const,
    },
  ];
};

const Index = () => {
  const [currentStatement, setCurrentStatement] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleVerification = async (statement: string) => {
    setCurrentStatement(statement);
    const verificationResults = await verifyStatement(statement);
    setResults(verificationResults);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">Bunkr</h1>
          <p className="text-sage-light text-lg">
            Verify facts, combat misinformation, share truth.
          </p>
        </div>

        <VerificationForm onVerify={handleVerification} />
        {showResults && <ResultCard statement={currentStatement} results={results} />}
        <TrendingTopics />
      </div>
    </div>
  );
};

export default Index;