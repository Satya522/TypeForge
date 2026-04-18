import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms of Service | TypeForge',
  description: 'The rules of the platform.',
};

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            By accessing or using TypeForge, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our platform.
          </p>
        </>
      ),
    },
    {
      title: "2. Your Account",
      content: (
        <>
          <p>
            To unlock the full potential of TypeForge, you need an account. You are responsible for maintaining the confidentiality of your login credentials. We are not liable for any loss or damage arising from your failure to protect your account.
          </p>
        </>
      ),
    },
    {
      title: "3. Acceptable Use",
      content: (
        <>
          <p>We built TypeForge as a competitive yet respectful environment. When using the platform, particularly the multiplayer and community features, you agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Cheat:</strong> Use macros, bots, scripts, or any automated tools to artificially inflate your WPM or leaderboards. We have anti-cheat mechanisms. If you cheat, you get banned.</li>
            <li><strong>Harass:</strong> Engage in toxic behavior, harassment, or hate speech in the community portals or race lobbies.</li>
            <li><strong>Exploit:</strong> Attempt to hack, disrupt, or exploit the platform's infrastructure, APIs, or databases.</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Intellectual Property",
      content: (
        <>
          <p>
            The TypeForge brand, our custom 3D mechanical keyboard models, our Vantablack & Neon Green UI designs, and our source code are the intellectual property of TypeForge. You may not copy, rip, or redistribute our assets without explicit permission.
          </p>
        </>
      ),
    },
    {
      title: "5. Termination",
      content: (
        <>
          <p>
            We reserve the right to suspend or terminate your account at any time, for any reason, without notice. This is usually reserved for users who violate the Acceptable Use rules (cheating or harassment).
          </p>
        </>
      ),
    },
    {
      title: "6. Limitation of Liability",
      content: (
        <>
          <p>
            TypeForge is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free. In no event shall TypeForge be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Clear, simple rules. No bots, no toxicity. Just pure typing performance."
      lastUpdated="April 17, 2026"
      icon="terms"
      sections={sections}
    />
  );
}
