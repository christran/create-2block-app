import { BrainCircuit, CreditCardIcon, Folder, Home, LogIn, Settings2 } from "lucide-react";
import { PiOpenAiLogo, PiRobot } from "react-icons/pi";
import type { User } from "@2block/db/schema";
import { type ElementType } from "react";
import { Paths } from "@2block/shared/shared-constants";

export const dotsBG = "@apply [background-image:radial-gradient(hsla(0,0%,86%,0.3)1px,transparent_0)] [background-size:12px_12px] dark:[background-image:radial-gradient(hsla(0,0%,100%,0.02)1px,transparent_0)]"
export const gridBG = "@apply [background-image:linear-gradient(to_right,hsla(0,0%,86%,0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsla(0,0%,86%,0.15)_1px,transparent_1px)] [background-size:42px_42px] dark:[background-image:linear-gradient(to_right,hsla(0,0%,100%,0.015)_1px,transparent_1px),linear-gradient(to_bottom,hsla(0,0%,100%,0.015)_1px,transparent_1px)]"

interface NavbarItem {
  title: string;
  href: string;
  icon: ElementType;
  lottie?: string;
  roles: User["role"][];
  beta?: boolean;
}

interface NavbarCategory {
  category: string;
  items: NavbarItem[];
}

// Update navbarItems to use the defined types
export const navbarItems: NavbarCategory[] = [
  {
    category: "Main",
    items: [
      {
        title: "Dashboard",
        href: Paths.Dashboard,
        icon: Home,
        // lottie: "home",
        roles: ["default", "member", "premium", "admin"]
      },
      {
        title: "Files",
        href: Paths.Files,
        icon: Folder,
        roles: ["default", "member", "premium", "admin"],
        beta: true
      },
    ]
  },
  {
    category: "AI Models",
    items: [
      {
        title: "Claude 3.5 Sonnet",
        href: "#claude",
        icon: PiRobot,
        roles: ["member", "premium", "admin"]
      },
      {
        title: "GPT-4o + GPT-o1",
        href: "#gpt",
        icon: PiOpenAiLogo,
        roles: ["member", "premium", "admin"]
      },
      {
        title: "AGI",
        href: "#agi",
        icon: BrainCircuit,
        roles: ["premium", "admin"]
      },
    ]
  },
  {
    category: "Account",
    items: [
      {
        title: "Billing",
        href: Paths.Billing,
        icon: CreditCardIcon,
        roles: ["default", "member", "premium", "admin"]
      },
      {
        title: "Settings",
        href: Paths.Settings,
        icon: Settings2,
        roles: ["default", "member", "premium", "admin"]
      },
    ]
  },
];

export const guestNavBarItems: NavbarItem[] = [
  {
    title: "Home",
    href: Paths.Home,
    icon: Home,
    // lottie: "home",
    roles: ["guest"]
  },
  {
    title: "Login",
    href: Paths.Login,
    icon: LogIn,
    roles: ["guest"]
  },
];