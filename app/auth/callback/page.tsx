"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Wait a bit for the session to be available
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          // Try to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            throw sessionError;
          }
          // Get session again after refresh
          const {
            data: { session: refreshedSession },
          } = await supabase.auth.getSession();
          if (!refreshedSession) {
            throw new Error("No active session found after refresh");
          }
        }

        // Use the session if available, otherwise get the user directly
        const user = session?.user || (await supabase.auth.getUser()).data.user;

        if (!user) {
          throw new Error("No user found in session");
        }

        // Extract first name and last name from Google OAuth metadata
        let firstName = "";
        let lastName = "";

        if (user.user_metadata?.name) {
          // Split the full name at the first space
          const nameParts = user.user_metadata.name.split(" ", 2);
          firstName = nameParts[0] || "";
          lastName = nameParts[1] || "";
        }

        // Create or update profile with first name and last name
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            onboarding_completed: false,
          })
          .select();

        if (profileError) {
          console.error("Error creating/updating profile:", profileError);
          // Continue anyway - onboarding will handle profile creation
        }

        // Redirect to onboarding step 2 since we have basic info from Google
        router.push("/onboarding?step=2");
      } catch (error) {
        console.error("Callback error:", error);
        // Log more detailed error information
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        } else if (typeof error === "object" && error !== null) {
          console.error("Error object:", JSON.stringify(error, null, 2));
        } else {
          console.error("Unknown error type:", typeof error, error);
        }
        router.push("/auth/error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg">Authenticating...</p>
      </div>
    </div>
  );
}
