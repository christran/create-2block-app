import { env } from "@/env";
import { type Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Acceptable Use Policy",
  description: "Acceptable Use Policy",
};

const AcceptableUsePolicyPage = () => {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-center">Acceptable Use Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground text-center">Last updated: August 18th, 2024</p>
      <div className="space-y-6 text-muted-foreground">
        <p>This Acceptable Use Policy outlines the rules for using ✌️BLOCK:</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">1. Prohibited Activities</h2>
        <p>Users must not engage in any illegal, harmful, or disruptive activities on our platform.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">2. Content Guidelines</h2>
        <p>All content shared on ✌️BLOCK must be appropriate, respectful, and comply with our community standards.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">3. Security</h2>
        <p>Users are prohibited from attempting to breach or compromise the security of our systems.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">4. Intellectual Property</h2>
        <p>Respect copyright and intellectual property rights when using ✌️BLOCK.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">5. Spam and Misuse</h2>
        <p>Do not use ✌️BLOCK to distribute spam or engage in any form of platform misuse.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">6. Reporting Violations</h2>
        <p>Users are encouraged to report any violations of this policy to our support team.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">7. Consequences</h2>
        <p>Violation of this policy may result in account suspension or termination.</p>
      </div>
    </section>
  );
};

export default AcceptableUsePolicyPage;