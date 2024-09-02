"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { type DatabaseUserAttributes } from "@/lib/auth"
import { useEffect } from "react"
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LinkedAccounts({ user }: { user: DatabaseUserAttributes | null }) {
  const [googleId, setGoogleId] = useState(user?.googleId ?? "");
  const [discordId, setdiscordId] = useState(user?.discordId ?? "");
  const [githubId, setgithubId] = useState(user?.githubId ?? "");
  const [state, formAction] = useFormState(updatePassword, null);
  // const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast("Two factor updated");
      router.refresh();
    }
    if (state?.error) {
      toast(state?.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
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
                  disabled
                  name="google_id"
                  type="text"
                  value={googleId}
                  />
              <Label>Discord</Label>
                  <Input
                  disabled
                  name="discord_id"
                  type="text"
                  value={discordId}
                  />
              <Label>GitHub</Label>
                  <Input
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