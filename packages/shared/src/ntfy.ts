interface NtfyPublishJSON {
  /** The topic to publish the notification to (required) (case-sensitive) */
  topic: string;
  /** The title of the notification (required) */
  title: string;
  /** The main content of the notification (required) */
  message: string;
  /** Whether the message should be parsed as markdown */
  markdown?: boolean;
  /** An array of emoji names to be displayed with the notification (https://docs.ntfy.sh/publish/#tags-emojis) */
  tags?: string[];
  /** The priority level of the notification (1-5, with 5 being highest) */
  priority?: number;
  /** URLs of attachments to be included with the notification */
  attach?: string;
  /** Custom filename for the attachment */
  filename?: string;
  /** URL to open when the notification is clicked (https://docs.ntfy.sh/publish/#click-action) */
  click?: string;
  /** Array of action buttons to be displayed with the notification (https://docs.ntfy.sh/publish/#using-a-json-array) */
  actions?: { action: string, label: string, url: string, clear?: boolean }[];
  /** URL of an icon to be displayed with the notification */
  icon?: string;
  /** Email address for email notifications */
  email?: string;
  /** Delay in seconds before the notification is sent e.g: 30min, 9am, 4 hours, 1 day, or a timestamp */
  delay?: string;
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

  console.log(JSON.stringify(ntfy));
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
    ],
    attach: "https://123.com"
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
    ],
    email: "christophertran714@gmail.com"
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