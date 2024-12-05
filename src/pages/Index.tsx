import { useEffect, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { VerificationForm } from "@/components/VerificationForm";
import { ResultCard } from "@/components/ResultCard";
import { Feed } from "@/components/Feed";
import { SearchUsers } from "@/components/SearchUsers";
import { TrendingTopics } from "@/components/TrendingTopics";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [currentStatement, setCurrentStatement] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleVerify = (statement: string, results: any[]) => {
    setCurrentStatement(statement);
    setVerificationResults(results);
  };

  const Logo = () => (
    <div className="w-full flex justify-center mb-8">
      <img 
        src="/lovable-uploads/bbbcc199-7eed-436a-864f-91dc9f0a1df4.png" 
        alt="BUNKr Logo" 
        className="h-16 md:h-20"
      />
    </div>
  );

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Logo />
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center">
          <Logo />
          <div className="w-full flex justify-end">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-gray-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>

        <Tabs defaultValue="verify" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verify">Verify Statement</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verify" className="space-y-4">
            <VerificationForm onVerify={handleVerify} />
            {verificationResults.length > 0 && (
              <ResultCard
                statement={currentStatement}
                results={verificationResults}
              />
            )}
          </TabsContent>
          
          <TabsContent value="explore" className="space-y-8">
            <SearchUsers />
            <TrendingTopics />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Verifications</h2>
          <Feed />
        </div>
      </div>
    </div>
  );
};

export default Index;