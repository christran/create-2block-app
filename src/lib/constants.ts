import { DesktopIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { CreditCardIcon, Settings2 } from "lucide-react";
import { PiOpenAiLogo, PiRobot } from "react-icons/pi";

export const APP_TITLE = "✌️BLOCK";
export const APP_DESCRIPTION = "2BLOCK"
export const APP_TITLE_PLAIN = "2BLOCK"
export const APP_TITLE_UNSTYLED = "BLOCK"
export const DATABASE_PREFIX = "2block";
export const TEST_DB_PREFIX = "test_2block";
export const EMAIL_SENDER_NAME = '✌️BLOCK';
export const EMAIL_SENDER_ADDRESS = 'hello@2block.co';
export const EMAIL_SENDER = '✌️BLOCK <hello@2block.co>';
export const EMAIL_UNSUBSCRIBE = "You received this email because you agreed to receive emails from 2BLOCK. If you no longer wish to receive emails like this,"
export const EMAIL_FOOTER = '2BLOCK Co. ・1337 Legit Sreet ・Los Angeles, CA 90015';

export enum Paths {
  Home = "/",
  Login = "/login",
  MagicLink = "/login/verify",
  Signup = "/signup",
  Dashboard = "/dashboard",
  Billing = "/dashboard/billing",
  Settings = "/dashboard/settings",
  Security = "/dashboard/settings?tab=security",
  LinkedAccounts = "/dashboard/settings?tab=linked-accounts",
  Usage = "/dashboard/settings?tab=usage",
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

export const navbarItems = [
  {
    category: "Main",
    items: [
      {
        title: "Dashboard",
        href: Paths.Dashboard,
        icon: DesktopIcon,
        roles: ["default", "member", "premium", "admin"]
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
        icon: PiOpenAiLogo,
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
