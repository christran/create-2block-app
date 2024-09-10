import { DesktopIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { CreditCardIcon } from "lucide-react";

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
  Signup = "/signup",
  Dashboard = "/dashboard",
  Billing = "/dashboard/billing",
  Settings = "/dashboard/settings",
  Security = "/dashboard/settings/security",
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
  Subscribe = "https://resend.2block.co/subscribe",
  Unsubscribe = "https://resend.2block.co/unsubscribe",
  ManageEmailSubscription = "https://resend.2block.co/manage",
  TermsOfService = "/legal/terms-of-service",
  PrivacyPolicy = "/legal/privacy",
  AcceptableUsePolicy = "/legal/acceptable-use",
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

