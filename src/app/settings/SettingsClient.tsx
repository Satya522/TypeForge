"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import type { UserSettings } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

const settingsSchema = z.object({
  soundEnabled: z.boolean(),
  leaderboardVisible: z.boolean(),
  dailyGoal: z.number().min(1).max(100),
  preferredDuration: z.enum(['S15', 'S30', 'S60', 'S120']),
  reducedMotion: z.boolean(),
  accentColor: z.string().min(1),
  fontFamily: z.string().min(1),
  fontSize: z.number().min(12).max(24),
  notificationsEnabled: z.boolean(),
  theme: z.enum(['dark', 'light']),
  language: z.enum(['en', 'hi', 'es']),
});

type SettingsValues = z.infer<typeof settingsSchema>;

type SettingsClientProps = {
  settings: UserSettings;
};

export default function SettingsClient({ settings }: SettingsClientProps) {
  const { updateSettings } = useTheme();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      soundEnabled: settings.soundEnabled,
      leaderboardVisible: settings.leaderboardVisible,
      dailyGoal: settings.dailyGoal,
      preferredDuration: settings.preferredDuration,
      reducedMotion: settings.reducedMotion,
      accentColor: settings.accentColor ?? 'blue',
      fontFamily: settings.fontFamily ?? 'Inter',
      fontSize: settings.fontSize ?? 16,
      notificationsEnabled: settings.notificationsEnabled ?? true,
      theme: settings.theme === 'light' ? 'light' : 'dark',
      language: settings.language === 'hi' || settings.language === 'es' ? settings.language : 'en',
    },
  });

  const onSubmit = async (values: SettingsValues) => {
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to update settings');
        return;
      }

      toast.success('Settings saved');
      updateSettings({
        theme: values.theme,
        accentColor: values.accentColor,
        fontFamily: values.fontFamily,
        fontSize: values.fontSize,
        notificationsEnabled: values.notificationsEnabled,
      });
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Sound Effects</p>
          <p className="text-sm text-gray-400">Enable key press sounds during sessions</p>
        </div>
        <input type="checkbox" {...register('soundEnabled')} className="h-5 w-5 accent-accent-200" />
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Leaderboard Visibility</p>
          <p className="text-sm text-gray-400">Show my stats on public leaderboards</p>
        </div>
        <input type="checkbox" {...register('leaderboardVisible')} className="h-5 w-5 accent-accent-200" />
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Daily Goal</p>
          <p className="text-sm text-gray-400">Number of lessons or sessions per day</p>
        </div>
        <input
          type="number"
          {...register('dailyGoal', { valueAsNumber: true })}
          min={1}
          max={100}
          className="w-20 rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100"
        />
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Preferred Session Duration</p>
          <p className="text-sm text-gray-400">Select default practice time</p>
        </div>
        <select {...register('preferredDuration')} className="rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100">
          <option value="S15">15s</option>
          <option value="S30">30s</option>
          <option value="S60">60s</option>
          <option value="S120">120s</option>
        </select>
      </div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="font-medium text-gray-100">Reduced Motion</p>
          <p className="text-sm text-gray-400">Disable certain animations</p>
        </div>
        <input type="checkbox" {...register('reducedMotion')} className="h-5 w-5 accent-accent-200" />
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Accent Color</p>
          <p className="text-sm text-gray-400">Choose your preferred accent hue</p>
        </div>
        <select {...register('accentColor')} className="rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100">
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="orange">Orange</option>
        </select>
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Font Family</p>
          <p className="text-sm text-gray-400">Select the font used throughout the interface</p>
        </div>
        <select {...register('fontFamily')} className="rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100">
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="monospace">Monospace</option>
          <option value="Source Code Pro">Source Code Pro</option>
        </select>
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Font Size</p>
          <p className="text-sm text-gray-400">Adjust the base font size (12-24px)</p>
        </div>
        <input
          type="number"
          {...register('fontSize', { valueAsNumber: true })}
          min={12}
          max={24}
          className="w-24 rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100"
        />
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Notifications</p>
          <p className="text-sm text-gray-400">Receive reminders to practice and keep streaks</p>
        </div>
        <input type="checkbox" {...register('notificationsEnabled')} className="h-5 w-5 accent-accent-200" />
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Theme</p>
          <p className="text-sm text-gray-400">Choose between dark and light modes</p>
        </div>
        <select {...register('theme')} className="rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div className="flex items-center justify-between border-b border-surface-300 pb-4">
        <div>
          <p className="font-medium text-gray-100">Language</p>
          <p className="text-sm text-gray-400">Select your preferred language</p>
        </div>
        <select {...register('language')} className="rounded-md border border-surface-300 bg-surface-200 px-2 py-1 text-gray-100">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="es">Español</option>
        </select>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
