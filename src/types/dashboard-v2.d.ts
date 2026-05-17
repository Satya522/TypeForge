declare module '@/components/dashboard/DashboardV2' {
  import type { ComponentType } from 'react';

  export type DashboardV2StepStatus = 'completed' | 'active' | 'locked';

  export type DashboardV2Props = {
    progress: {
      streakDays: number;
      streakLabel: string;
      topPercent: string;
      weekData: boolean[];
    };
    analytics: {
      accuracy: number;
      accuracyChange: string;
      avgSpeed: number;
      speedChange: string;
      weakKeys: string[];
    };
    lessons: {
      steps: Array<{
        name: string;
        status: DashboardV2StepStatus;
        percent?: number;
      }>;
      tags: string[];
    };
    realtime: {
      wpm: number;
      acc: number;
      rhythm: string;
      rhythmScore: number;
    };
    practice: {
      modes: Array<{
        label: string;
        active: boolean;
      }>;
      inputPlaceholder: string;
    };
  };

  const DashboardV2: ComponentType<DashboardV2Props>;
  export default DashboardV2;
}
