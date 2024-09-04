import { DesktopIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { CreditCardIcon } from "lucide-react";

export const APP_TITLE = "✌️BLOCK";
export const APP_DESCRIPTION = "2BLOCK"
export const APP_TITLE_UNSTYLED = "BLOCK"
export const DATABASE_PREFIX = "2block";
export const TEST_DB_PREFIX = "test_2block";
export const EMAIL_SENDER = '✌️BLOCK <hello@2block.co>';

export enum Paths {
  Home = "/",
  Login = "/login",
  Signup = "/signup",
  Dashboard = "/dashboard",
  Billing = "/dashboard/billing",
  Settings = "/dashboard/settings",
  Security = "/dashboard/settings/security",
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
}

export const navbarItems = [
  {
    title: "Dashboard",
    href: Paths.Dashboard,
    icon: DesktopIcon,
  },
  {
    title: "Billing",
    href: Paths.Billing,
    icon: CreditCardIcon,
  },
  {
    title: "Profile",
    href: Paths.Settings,
    icon: PersonIcon,
  },

  {
    title: "Security",
    href: Paths.Security,
    icon: LockClosedIcon,
  }
];

