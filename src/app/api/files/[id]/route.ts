import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedGetUrl, deleteFile } from '@/lib/r2';
import { db } from '@/server/db';
import { files } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateRequest } from '@/lib/auth/validate-request';
import { redirect } from 'next/navigation';
import { Paths } from '@/lib/constants';
import { validate as uuidValidate } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // const { user } = await validateRequest();

  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const publicBucket = true;

  try {
    if (!params.id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Validate UUID
    if (!uuidValidate(params.id)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const fileRecord = await db.query.files.findFirst({
      where: eq(files.id, params.id),
    });

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (publicBucket) { // https://media.2block.co/
      return NextResponse.json({ url: `https://media.2block.co/${fileRecord.id}`, filename: fileRecord.originalFilename });
    }

    const presignedUrl = await generatePresignedGetUrl(fileRecord.id);
    
    return NextResponse.json({ url: presignedUrl, filename: fileRecord.originalFilename });
  } catch (error) {
    console.error('Error in GET file route:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const fileRecord = await db.query.files.findFirst({
      where: eq(files.id, params.id),
    });

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if the user is the owner of the file
    if (fileRecord.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await deleteFile(fileRecord.id);
    
    await db.delete(files).where(eq(files.id, params.id));

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE file route:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}