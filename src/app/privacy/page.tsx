import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy | TypeForge',
  description: 'How we handle your data with absolute transparency.',
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. The Bottom Line",
      content: (
        <>
          <p>
            At TypeForge, we believe privacy is a fundamental human right. We collect only what we need to run the platform, improve your experience, and keep your data secure. We will never sell your personal information to third parties. Ever.
          </p>
        </>
      ),
    },
    {
      title: "2. What We Collect",
      content: (
        <>
          <p>When you use TypeForge, we collect a minimal set of data to provide you with the best experience possible:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account Data:</strong> Your email address and basic profile information (like your username) when you sign up using your Google Account or email.</li>
            <li><strong>Performance Metrics:</strong> Your typing speed (WPM), accuracy, keystroke mistakes, and session durations across all practice modes and games. This is core to our service.</li>
            <li><strong>Usage Logs:</strong> Standard web data such as your IP address, browser type, and operating system, which helps us diagnose bugs and prevent abuse.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. How We Use Your Data",
      content: (
        <>
          <p>We use your data purely to power the TypeForge engine. Specifically, we use it to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Generate your detailed performance analytics, roadmaps, and heatmaps.</li>
            <li>Maintain multiplayer synchronization and leaderboard rankings.</li>
            <li>Fix bugs, optimize latency, and improve the overall platform experience.</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Data Storage & Security",
      content: (
        <>
          <p>
            Your data is stored securely in modern, encrypted databases (Cloud Firestore and Postgres). Authentication is handled entirely by Firebase Auth, meaning your passwords and core credentials are never directly touching our databases.
          </p>
          <p className="mt-4">
            We use industry-standard encryption at rest and in transit. However, no database on earth is 100% impenetrable. While we do everything in our power to secure your data, you use TypeForge at your own risk.
          </p>
        </>
      ),
    },
    {
      title: "5. Your Rights & Control",
      content: (
        <>
          <p>You own your data. At any time, you have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Request an export:</strong> Download a copy of your performance statistics.</li>
            <li><strong>Delete your account:</strong> You can completely wipe your account and all associated metrics from the dashboard settings. Once deleted, it cannot be undone.</li>
          </ul>
        </>
      ),
    },
    {
      title: "6. Changes to This Policy",
      content: (
        <>
          <p>
            We may update this Privacy Policy from time to time as we add new "beast level" features. If the changes are massive, we’ll let you know via email or an in-platform notification. Otherwise, checking back here occasionally is your best bet.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Plain English. No tracking gimmicks. Just the facts about how we protect your typing data."
      lastUpdated="April 17, 2026"
      icon="privacy"
      sections={sections}
    />
  );
}
