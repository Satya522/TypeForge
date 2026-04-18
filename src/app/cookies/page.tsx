import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Cookie Policy | TypeForge',
  description: 'How we use cookies to power your typing experience.',
};

export default function CookiesPage() {
  const sections = [
    {
      title: "1. What is a Cookie?",
      content: (
        <>
          <p>
            No, not the chocolate chip kind. A cookie is a tiny text file saved in your browser when you visit a website. It helps the site remember things about you—like the fact that you're logged in, or your preferred theme settings.
          </p>
        </>
      ),
    },
    {
      title: "2. The Cookies We Actually Use",
      content: (
        <>
          <p>We hate bloated, invasive tracking cookies as much as you do. TypeForge only uses cookies that are absolutely necessary to run the app:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Authentication Cookies:</strong> These are managed by Firebase Auth to keep you securely logged in between sessions so you don't have to re-enter your password every time you visit.</li>
            <li><strong>Session & Security Cookies:</strong> Small tokens that help secure the WebSocket connections for competitive Race Mode and Community Raids.</li>
            <li><strong>Preference Cookies:</strong> Sometimes we use Local Storage in your browser (similar to cookies) to remember your local preferences, like whether you prefer clicking mechanical keyboard sounds on or off.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. What We Don't Do",
      content: (
        <>
          <p>
            We do not use invasive third-party advertising cookies. We do not track you across other websites. We do not sell your browsing profiles to data brokers. TypeForge is built for typing, not for targeted advertising.
          </p>
        </>
      ),
    },
    {
      title: "4. Your Consent & Control",
      content: (
        <>
          <p>
            By using TypeForge, you agree to our use of these essential functional cookies. Because they are strictly necessary for the platform to function, there is no opt-out toggle. If you really don't want these cookies, you can disable cookies in your browser settings—but be warned, you won't be able to log in or save your progress.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="The only cookies we use are essential ones. Zero invasive tracking."
      lastUpdated="April 17, 2026"
      icon="cookies"
      sections={sections}
    />
  );
}
