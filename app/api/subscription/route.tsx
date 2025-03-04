import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";


export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
        return NextResponse.json({ "error": "Email is required" }, { status: 400 });
    }
    const totalCredits = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return NextResponse.json(totalCredits[0], { status: 200 });
}