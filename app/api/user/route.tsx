
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";

export async function POST(req: NextRequest) {
    const { userEmail, userName } = await req.json();

    // try {
    const result = await db.select().from(usersTable)
        .where(eq(usersTable.email, userEmail));

    if (result?.length == 0) {

        const result: any = await db.insert(usersTable).values({
            name: userName,
            email: userEmail,
            credits: 0,
            // @ts-ignore
        }).returning(usersTable);

        return NextResponse.json(result[0]);
    }
    return NextResponse.json(result[0]);


    // } catch (e) {
    //     return NextResponse.json(e)
    // }
}


export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
        return NextResponse.json({ "error": "Email is required" }, { status: 400 });
    }
    const totalCredits = await db.select().from(usersTable).where(eq(usersTable.email, email));

    // Ensure user exists before accessing properties
    const user = totalCredits.length > 0 ? totalCredits[0] : null;

    if (!user || user.credits === null || user.credits === undefined || user.credits <= 0) {
        return NextResponse.json({ error: "You don't have enough credits" }, { status: 400 });
    } else {
        return NextResponse.json(totalCredits[0], { status: 200 });
    }

}