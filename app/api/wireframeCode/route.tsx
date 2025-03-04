import { db } from "@/configs/db";
import { generateCodeTable, usersTable } from "@/configs/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { uid, email, imageURL, model, prompt } = await req.json();

    const result = await db.insert(generateCodeTable).values({
        uid: uid,
        imageURL: imageURL,
        model: model,
        prompt: prompt,
        createdBy: email
    }).returning({ id: generateCodeTable.id })

    const credits = await db
        .update(usersTable)
        .set({ credits: sql`${usersTable.credits} - 1` })
        .where(eq(usersTable.email, email));

    return NextResponse.json(result);
}


export async function GET(req: NextRequest) {
    const url = req.url;
    const { searchParams } = new URL(url);
    const uid = searchParams?.get('uid');
    const email = searchParams?.get('email');

    if (uid) {
        const result = await db.select().from(generateCodeTable).where(eq(generateCodeTable.uid, uid));
        return NextResponse.json(result);
    } else if (email) {
        const result = await db.select().from(generateCodeTable).where(eq(generateCodeTable.createdBy, email));
        return NextResponse.json(result);
    }

    return NextResponse.json({ "error": "No recod found with this uid or email" });
}


export async function PUT(req: NextRequest) {
    const { uid, code } = await req.json();

    const result = await db.update(generateCodeTable).set({ code: code }).where(eq(generateCodeTable.uid, uid)).returning({ uid: generateCodeTable.uid });

    return NextResponse.json(result);
}