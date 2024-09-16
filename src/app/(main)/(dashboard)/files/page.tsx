import { validateRequest } from '@/lib/auth/validate-request';
import { UploadFiles } from './upload-files';
import { redirect } from 'next/navigation';
import { Paths } from '@/lib/constants';
import ManageFiles from './manage-files';
import { db } from '@/server/db';
import { files } from '@/server/db/schema';
import { eq } from "drizzle-orm";

export default async function UploadPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);
  if (user?.role !== "admin") redirect(Paths.Dashboard);

  const userFiles = await db.select({
    id: files.id,
  })
  .from(files)
  .where(eq(files.userId, user.id))

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-2 py-8 space-y-8">
      <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold mb-6">Files</h1>
      <UploadFiles initialUserFiles={userFiles} />
    </div>
  );
}