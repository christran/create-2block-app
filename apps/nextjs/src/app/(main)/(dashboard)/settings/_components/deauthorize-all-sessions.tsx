"use client"

import { useState } from "react";
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { deauthorizeAllSessions } from "@/lib/auth/actions"
import { Paths } from "@2block/shared/shared-constants"

export function DeauthorizeAllSessions() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeauthorize = async () => {
    setIsLoading(true);
    try {
      const result = await deauthorizeAllSessions();

      if (result.success) {
        toast.success("All sessions have been deauthorized");
        router.push(Paths.Login);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while deauthorizing sessions");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b px-6 py-4">
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Sign out of your account everywhere
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full md:w-1/2 space-y-2 pt-4">
          <div className="space-y-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  Deauthorize All Sessions
                </Button>
              </DialogTrigger>
              <DialogContent className="md:max-w w-[90vw] rounded-lg" showCloseButton={false}>
                <DialogHeader className="flex flex-col space-y-2 text-center sm:text-left">
                  <DialogTitle className="text-lg font-semibold">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    This will sign you out of your account everywhere, including the session you are currently on.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeauthorize}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deauthorizing..." : "Deauthorize"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}