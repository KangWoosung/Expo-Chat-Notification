import { Database } from "@/db/supabase/supabase";
import { useSession } from "@clerk/clerk-expo";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null;
  isLoaded: boolean;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

type Props = {
  children: React.ReactNode;
};

export default function SupabaseProvider({ children }: Props) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // if (!session) return;

    // Add Clerk Auth Token as accessToken
    if (session) {
      const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        accessToken: () => session?.getToken(),
      });

      setSupabase(client);
      setIsLoaded(true);
    }
  }, [session]);

  return (
    <Context.Provider value={{ supabase, isLoaded }}>
      {/* {!isLoaded ? <Text>Loading Supabase...</Text> : children} */}
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return {
    supabase: context.supabase,
    isLoaded: context.isLoaded,
  };
};
