import DashboardV2 from '@/components/dashboard/DashboardV2';

export const metadata = {
  title: 'Dashboard V2 Preview – TypeForge',
  description: 'New premium glassmorphic dashboard design',
};

export default function DashboardPreviewPage() {
  const mockData = {
    progress: {
      streakDays: 12,
      streakLabel: "DAY STREAK",
      topPercent: "Top 5%",
      weekData: [true, true, true, true, true, true, false],
    },
    analytics: {
      accuracy: 96.2,
      accuracyChange: "+4.2%",
      avgSpeed: 84,
      speedChange: "+11 WPM",
      weakKeys: ["X", "C", "P"]
    },
    lessons: {
      steps: [
        { name: "Beginner", status: "completed" },
        { name: "Rhythm", status: "completed" },
        { name: "Accuracy", status: "active", percent: 74 },
        { name: "Mastery", status: "locked" }
      ],
      tags: ["Adaptive", "Structured", "Trackable"]
    },
    realtime: {
      wpm: 92,
      acc: 98,
      rhythm: "Good",
      rhythmScore: 85
    },
    practice: {
      modes: [
        { label: "Code", active: false },
        { label: "AI Prompts", active: true },
        { label: "Dictation", active: false },
        { label: "Sprint", active: false },
        { label: "Focus", active: false }
      ],
      inputPlaceholder: "// Generate AI prompt"
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ color: '#f8fafc', marginBottom: '30px', fontSize: '32px' }}>Premium Dashboard V2</h1>
      <DashboardV2 {...mockData} />
    </div>
  );
}
