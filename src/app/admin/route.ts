import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/authz/admin";

export async function GET() {
  const result = await getCurrentAdmin();

  if (!result.allowed) {
    return NextResponse.json(
      {
        error:
          result.reason === "unauthenticated" ? "unauthenticated" : "forbidden",
      },
      { status: result.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  return NextResponse.json({
    status: "ok",
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
  });
}
