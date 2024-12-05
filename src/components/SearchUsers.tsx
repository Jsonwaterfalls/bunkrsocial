import { useState } from "react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FollowButton } from "./FollowButton";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search-users", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${debouncedSearch}%`)
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: debouncedSearch.length > 0,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <Input
        type="search"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      
      {searchTerm && (
        <Card className="p-4 space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Searching...</p>
          ) : searchResults?.length === 0 ? (
            <p className="text-center text-muted-foreground">No users found</p>
          ) : (
            searchResults?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.username}</span>
                </div>
                <FollowButton targetUserId={user.id} />
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
};