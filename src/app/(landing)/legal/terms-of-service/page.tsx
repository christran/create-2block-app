import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "✌️BLOCK - Terms of Service",
  description: "Terms of Service for ✌️BLOCK",
};

const TermsOfServicePage = () => {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-center">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground text-center">Last updated: August 18th, 2024</p>
      <div className="space-y-6 text-muted-foreground">
        <p>Welcome to ✌️BLOCK. By using our service, you agree to these terms:</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing or using ✌️BLOCK, you agree to be bound by these Terms of Service.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">2. User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">3. Prohibited Activities</h2>
        <p>You agree not to engage in any illegal, abusive, or unauthorized activities on our platform.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">4. Intellectual Property</h2>
        <p>All content and materials available on ✌️BLOCK are protected by applicable intellectual property laws.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
        <p>✌️BLOCK shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">6. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms of Service at any time. Your continued use of ✌️BLOCK after changes constitutes acceptance of those changes.</p>
        
        <h2 className="mt-6 text-xl font-semibold text-foreground">7. Governing Law</h2>
        <p>These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction].</p>
      </div>
    </section>
  );
};

export default TermsOfServicePage;
