interface NtfyPublishJSON {
  topic: string;
  title: string;
  message: string;
  tags: string[];
  priority: number;
  click: string;
  actions: { action: string, label: string, url: string }[];
}

export async function sendNtfy(ntfy: NtfyPublishJSON) {
  await fetch(process.env.NTFY_URL ?? "https://ntfy.2block.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NTFY_API_KEY}`,
    },
    body: JSON.stringify(ntfy),
  });
}

export async function newUserNotification(fullname: string, email: string) {
  await sendNtfy({
    topic: "2BLOCK",
    title: "New User",
    message: `${fullname} (${email}) just signed up.`,
    tags: ["white_check_mark" ],
    priority: 5,
    click: `${process.env.NEXT_PUBLIC_APP_URL}`,
    actions: [
      {
        action: "view",
        label: "View on 2BLOCK",
        url: `${process.env.NEXT_PUBLIC_APP_URL}`
      }
    ]
  })
}

export async function newLoginNotification(fullname: string, email: string) {
  await sendNtfy({
    topic: "2BLOCK",
    title: "New Login",
    message: `${fullname} (${email}) just logged in.`,
    tags: ["white_check_mark" ],
    priority: 5,
    click: `${process.env.NEXT_PUBLIC_APP_URL}`,
    actions: [
      {
        action: "view",
        label: "View on 2BLOCK",
        url: `${process.env.NEXT_PUBLIC_APP_URL}`
      }
    ]
  })
}

export async function accountDeletedNotification(fullname: string, email: string) {
  await sendNtfy({
    topic: "2BLOCK",
    title: "Account Deleted",
    message: `${fullname} (${email}) just deleted their account.`,
    tags: ["x" ],
    priority: 5,
    click: `${process.env.NEXT_PUBLIC_APP_URL}`,
    actions: [
      {
        action: "view",
        label: "View on 2BLOCK",
        url: `${process.env.NEXT_PUBLIC_APP_URL}`
      }
    ]
  })
}