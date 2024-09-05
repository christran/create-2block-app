"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
interface LinkedAccountProps {
  googleId: string | null
  discordId: string | null
  githubId: string | null
}

export function LinkedAccounts({ user }: { user: LinkedAccountProps }) {
  const [googleId, setGoogleId] = useState(user?.googleId ?? "");
  const [discordId, setdiscordId] = useState(user?.discordId ?? "");
  const [githubId, setgithubId] = useState(user?.githubId ?? "");
  const [state, formAction] = useFormState(updatePassword, null);
  // const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Account linked");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

    return (
      <form action={handleSubmit} className="grid gap-4">
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>Linked Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2 space-y-2">
              <Label>Google</Label>
                  <Input
                  className="bg-secondary/30"
                  disabled
                  name="google_id"
                  type="text"
                  value={googleId}
                  />
              <Label>Discord</Label>
                  <Input
                  className="bg-secondary/30"
                  disabled
                  name="discord_id"
                  type="text"
                  value={discordId}
                  />
              <Label>GitHub</Label>
                  <Input
                  className="bg-secondary/30"
                  disabled
                  name="github_id"
                  type="text"
                  value={githubId}
                  />
              </div>
          </CardContent>
        </Card>
    </form>
    )
}