import { getSession } from "@/lib/auth/get-session";
import { UploadFiles } from "./upload-files";
import { redirect } from "next/navigation";
import { Paths } from "@2block/shared/shared-constants";
import { api } from "@/trpc/server";

export default async function UploadPage() {
  const { user } = await getSession();

  if (!user) redirect(Paths.Login);
  if (user?.role !== "admin") redirect(Paths.Dashboard); // TODO: Remove this when we have a proper permissions system

  const userFiles = await api.user.getUserFiles();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 md:px-2 py-8 space-y-8">
        <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Files</h1>
      </div>

      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2 pb-8">
        <UploadFiles initialUserFiles={userFiles} />
      </div>
    </>
  );
}