import { env } from "@/env";
import { type Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Privacy Policy",
  description: "Privacy Policy",
};

const PrivacyPolicyPage = () => {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-center">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground text-center">Last updated: August 18th, 2024</p>
      <div className="space-y-6 text-muted-foreground">
        <p>This Privacy Policy explains how ✌️BLOCK collects, uses, and protects your personal information:</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">1. Information Collection</h2>
        <p>We collect personal information you provide when using ✌️BLOCK, including but not limited to your name, email address, and usage data.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">2. Use of Information</h2>
        <p>We use your information to provide and improve our services, communicate with you, and ensure platform security.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">3. Data Protection</h2>
        <p>We implement security measures to protect your personal information from unauthorized access or disclosure.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">4. Third-Party Sharing</h2>
        <p>We do not sell your personal information. We may share data with third-party service providers who assist in our operations.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">5. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to enhance your experience and collect usage information.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">6. User Rights</h2>
        <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">7. Policy Updates</h2>
        <p>We may update this policy periodically. Check this page for the latest version.</p>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;