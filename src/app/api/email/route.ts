import { sendEmail, EmailTemplate } from "@/lib/email/plunk";
import { absoluteUrl } from "@/lib/utils";
import { Paths } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  try {
    // Check for authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    switch (data.template) {
      case "welcome":
        await sendEmail(data.email, EmailTemplate.Welcome, { 
          fullname: data.fullname,
          url: absoluteUrl(Paths.Dashboard),
          unsubscribe: `${Paths.Unsubscribe}/${data.contactId}`
        });

        return NextResponse.json({ success: true });
      default:
        throw new Error(`Invalid email template: ${data.template}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}