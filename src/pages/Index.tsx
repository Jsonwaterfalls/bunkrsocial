import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AuthForm from "@/components/auth/AuthForm";
import VerificationForm from "@/components/VerificationForm";
import TrendingTopics from "@/components/TrendingTopics";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Index = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bunkr</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-600 hover:underline"
          >
            Sign Out
          </button>
        </div>
        <VerificationForm />
        <TrendingTopics />
      </div>
    </div>
  );
};

export default Index;