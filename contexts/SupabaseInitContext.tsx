/*
2025-07-16 22:05:52

Provider for overwrite supabase.auth with Clerk template token.

-- Instead of using supabase auth.uid() in the policy,
-- add policy that references Clerk user ID from JWT claim

-- The Policy must be like this:
create policy "Clerk users can view their own todos"
on todos for select
using (
  clerk_user_id = current_setting('request.jwt.claim.sub', true)
);

You must add Clerk template to assign Clerk user_id to request.jwt.claim.sub

*/
// /contexts/SupabaseInitContext.tsx
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";

type SupabaseInitProviderProps = {
  children: React.ReactNode;
};

const SupabaseInitContext = createContext<boolean | null>(null);

export const SupabaseInitProvider: React.FC<SupabaseInitProviderProps> = ({
  children,
}) => {
  const { getToken } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken({ template: "supabase" });
      if (token) {
        supabase.auth.setSession({ access_token: token, refresh_token: "" });
      }
      setReady(true); // ✅ 초기화 완료
    })();
  }, [getToken]);

  return (
    <SupabaseInitContext.Provider value={ready}>
      {children}
    </SupabaseInitContext.Provider>
  );
};

export const useSupabaseInit = () => {
  const ctx = useContext(SupabaseInitContext);
  if (ctx === null) {
    throw new Error("useSupabaseInit must be used inside SupabaseInitProvider");
  }
  return ctx;
};
/*
컴포넌트에서 SupabaseInit 작업 결과를 참조하고 로딩 상태를 조건부 랜더링 해줍니다.
const ready = useSupabaseInit();
if (!ready) return <SplashScreen />; // ✅ 초기화 되기 전엔 로딩 상태 유지
*/
