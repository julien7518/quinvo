"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Page() {
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const email = searchParams?.get("email") ?? "";
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const handleComplete = useCallback(
  //   async (code: string) => {
  //     setError(null);
  //     setLoading(true);
  //     try {
  //       const supabase = createClient();
  //       const { data, error } = await supabase.auth.verifyOtp({
  //         type: "email",
  //         token: code,
  //         email: email,
  //       });

  //       if (error) {
  //         setError(error.message ?? "Verification failed");
  //         setLoading(false);
  //         return;
  //       }

  //       // If a session was returned, the user is signed in. Redirect home.
  //       if (data?.session) {
  //         router.replace("/");
  //         return;
  //       }

  //       // No session but no error: still consider success and redirect.
  //       router.replace("/");
  //     } catch (e) {
  //       setError((e as Error).message ?? "Unexpected error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [router]
  // );

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              <div className="hidden flex justify-center">
                <InputOTP
                  maxLength={6}
                  // onComplete={handleComplete}
                  // disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {/* {error && <p className="text-sm text-destructive">{error}</p>} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
