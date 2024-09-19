import { BrainCircuit, CreditCardIcon, Folder, Home, LogIn, Settings2 } from "lucide-react";
import { PiOpenAiLogo, PiRobot } from "react-icons/pi";
import type { User } from "@/server/db/schema";
import { type ElementType } from "react";
export const APP_TITLE = "✌️BLOCK";
export const APP_DESCRIPTION = "2BLOCK"
export const APP_TITLE_PLAIN = "2BLOCK"
export const APP_TITLE_UNSTYLED = "BLOCK"
export const DATABASE_PREFIX = "2block";
export const TEST_DB_PREFIX = "test_2block";
export const EMAIL_SENDER_NAME = "✌️BLOCK";
export const EMAIL_SENDER_ADDRESS = "hello@2block.co";
export const EMAIL_SENDER = "✌️BLOCK <hello@2block.co>";
export const EMAIL_UNSUBSCRIBE = "You received this email because you agreed to receive emails from 2BLOCK. If you no longer wish to receive emails like this,"
export const EMAIL_FOOTER = "2BLOCK Co. ・1337 Legit Sreet ・Los Angeles, CA 90015";

export const dotsBG = "@apply [background-image:radial-gradient(hsla(0,0%,86%,0.3)1px,transparent_0)] [background-size:12px_12px] dark:[background-image:radial-gradient(hsla(0,0%,100%,0.02)1px,transparent_0)]"
export const gridBG = "@apply [background-image:linear-gradient(to_right,hsla(0,0%,86%,0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsla(0,0%,86%,0.15)_1px,transparent_1px)] [background-size:42px_42px] dark:[background-image:linear-gradient(to_right,hsla(0,0%,100%,0.015)_1px,transparent_1px),linear-gradient(to_bottom,hsla(0,0%,100%,0.015)_1px,transparent_1px)]"

export enum Paths {
  Home = "/",
  Login = "/login",
  MagicLink = "/login/verify",
  Signup = "/signup",
  Dashboard = "/home",
  Files = "/files",
  Billing = "/billing",
  Settings = "/settings",
  Security = "/settings?tab=security",
  LinkedAccounts = "/settings?tab=linked-accounts",
  Usage = "/settings?tab=usage",
  Admin = "/admin",
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
  Subscribe = "https://resend.2block.co/subscribe",
  Unsubscribe = "https://resend.2block.co/unsubscribe",
  ManageEmailSubscription = "https://resend.2block.co/manage",
  TermsOfService = "/terms-of-service",
  PrivacyPolicy = "/privacy",
  AcceptableUsePolicy = "/acceptable-use",
  GitHub = "https://github.com/christran",
}

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
        href: "#",
        icon: PiRobot,
        roles: ["member", "premium", "admin"]
      },
      {
        title: "GPT-4o + GPT-o1",
        href: "#",
        icon: PiOpenAiLogo,
        roles: ["member", "premium", "admin"]
      },
      {
        title: "AGI",
        href: "#",
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