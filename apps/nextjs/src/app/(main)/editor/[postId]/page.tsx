import React from "react";
import { api } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";
import { PostEditor } from "./_components/post-editor";
import { ArrowLeftIcon } from "@/components/icons";
import Link from "next/link";
import { validateRequest } from "@2block/auth";
import { Paths } from "@2block/shared/shared-constants";

interface Props {
  params: {
    postId: string;
  };
}

export default async function EditPostPage({ params }: Props) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const post = await api.post.get({ id: params.postId });
  if (!post) notFound();

  return (
    <main className="container min-h-[calc(100vh-160px)] pt-3 md:max-w-screen-md">
      <Link
        href={Paths.Dashboard}
        className="mb-3 flex items-center text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Dashboard
      </Link>

      <PostEditor post={post} />
    </main>
  );
}
