import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { VerificationForm } from "@/components/VerificationForm";
import { ResultCard } from "@/components/ResultCard";
import { Feed } from "@/components/Feed";
import { SearchUsers } from "@/components/SearchUsers";
import { TrendingTopics } from "@/components/TrendingTopics";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload, User } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [currentStatement, setCurrentStatement] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${session?.user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", session?.user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
      
      fetchProfile(session?.user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error uploading avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = (statement: string, results: any[]) => {
    setCurrentStatement(statement);
    setVerificationResults(results);
  };

  const handleUpdateUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", session?.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      
      fetchProfile(session?.user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating username",
        variant: "destructive",
      });
    }
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
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      profile?.avatar_url
                        ? `https://rwmfoqgrvinrcxkjtzdz.supabase.co/storage/v1/object/public/avatars/${profile.avatar_url}`
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {profile?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <form onSubmit={handleUpdateUsername} className="flex gap-2">
                <Input
                  name="username"
                  placeholder="Update username"
                  defaultValue={profile?.username || ""}
                />
                <Button type="submit" size="sm">
                  Update
                </Button>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPopover />
              <Link to={`/profile/${session?.user.id}`}>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => supabase.auth.signOut()}
                className="text-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
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
