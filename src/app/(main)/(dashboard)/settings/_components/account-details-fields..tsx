"use server"

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

export async function AccountDetailsFields() {
  const user = await api.user.getUser.query();

  if (!user) notFound();

  // const [fullname, setFullname] = useState(user?.fullname ?? "");
  // const [email, setEmail] = useState(user?.email ?? "");

  return (
    <CardContent>
    <div className="w-full md:w-1/2 space-y-2">
      <Label>Full Name</Label>
      <Input
        className="bg-secondary/30"
        required
        placeholder="Jeon Jungkook"
        autoComplete="name"
        name="fullname"
        type="text"
        value={user?.fullname}
        // onChange={(e) => setFullname(e.target.value)}
        />
      <Label>Email</Label>
      <Input
        // required={user?.accountPasswordless === null}
        // readOnly={true}
        className="bg-secondary/30"
        placeholder="hello@2block.co"
        autoComplete="email"
        name="email"
        type="email"
        value={user?.fullname}
        // onChange={(e) => setEmail(e.target.value)}
        // disabled={user?.accountPasswordless === null}
        />
    </div>
  </CardContent>
  )
}