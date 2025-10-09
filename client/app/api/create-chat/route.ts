import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// This defines the POST /api/create-chat endpoint
export async function POST(req: Request) {
  try {
    // 1. Get the authenticated user from the request
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { file_key, file_name, file_url } = body;

    // 2. Save the file metadata to our database using Prisma
    const newFile = await db.file.create({
      data: {
        key: file_key,
        name: file_name,
        url: file_url,
        userId: userId,
      },
    });

    // 3. TODO: In the next step, we will trigger the background job here
    // to process the PDF and create embeddings.

    // 4. Respond with the new file's ID
    return NextResponse.json({ fileId: newFile.id }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/create-chat:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}