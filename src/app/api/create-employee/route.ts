import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, displayName, password } = await req.json();

  if (!username || !displayName || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Use service role key to create users without email verification
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = `${username.toLowerCase().trim()}@dhl-training.local`;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    username: username.toLowerCase().trim(),
    display_name: displayName,
    role: "employee",
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
