import { createClient } from "./client";

export async function handleOAuthSignIn(provider: "google" | "apple") {
  const supabase = createClient();

  try {
    // Sign in with the OAuth provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Force the use of PKCE flow which is more secure and works better with custom redirect URIs
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("OAuth sign-in error:", error);
    throw error;
  }
}

export async function createOrUpdateProfile(
  userId: string,
  userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
) {
  const supabase = createClient();

  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows found", which is expected for new users
      throw fetchError;
    }

    const profileData = {
      id: userId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      updated_at: new Date().toISOString(),
    };

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from("profiles")
        .insert(profileData);

      if (insertError) {
        throw insertError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    throw error;
  }
}
