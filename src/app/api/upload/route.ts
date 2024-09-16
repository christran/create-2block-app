import { NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/r2';
import { v4 as uuidv4 } from "uuid";
import { db } from '@/server/db';
import { files } from '@/server/db/schema';
import { validateRequest } from '@/lib/auth/validate-request';

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { files: fileRequests } = await request.json();
    
    if (!fileRequests || !Array.isArray(fileRequests)) {
      return NextResponse.json({ error: 'Invalid files data' }, { status: 400 });
    }

    const presignedUrls = await Promise.all(
      fileRequests.map(async ({ filename, contentType }) => {
        if (!filename || !contentType) {
          throw new Error('Missing filename or contentType');
        }

        const metadata = {
          userId: user.id
        }
    
        const uuid = uuidv4();
        const presignedData = await generatePresignedUrl(
          uuid, 
          contentType,
          metadata,
        );
        
        // Store file info in the database
        await db.insert(files).values({
          id: uuid,
          userId: user.id,
          originalFilename: filename,
          contentType,
        });
    
        return {
          id: uuid,
          filename,
          ...presignedData,
          metadata,
        };
      })
    );

    // console.log('Presigned URLs generated successfully:', presignedUrls);
    return NextResponse.json({ presignedUrls });
  } catch (error) {
    console.error('Error in upload API route:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}