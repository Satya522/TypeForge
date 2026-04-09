"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * SubscriptionPage presents pricing plans for TypeForge. In a real
 * integration you would use Stripe or another payment provider to
 * handle checkout. Here we display a simple comparison between a
 * free tier and a premium tier. Clicking the subscribe button
 * simulates starting the checkout flow.
 */
export default function SubscriptionPage() {
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = () => {
    // In a real app you'd call a backend API route that creates a
    // Stripe Checkout session and redirects the user. For this demo
    // we'll just mark the user as subscribed.
    setSubscribed(true);
  };

  return (
    <div className="mx-auto max-w-3xl py-16 px-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Upgrade to Premium</h1>
      <p className="text-gray-300 max-w-prose">
        Unlock advanced analytics, personalized AI recommendations, coding practice
        integrations, multiplayer races and more with a TypeForge Premium subscription.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-surface-300 rounded-lg p-6 bg-surface-200">
          <h2 className="text-xl font-semibold mb-2">Free</h2>
          <p className="text-2xl font-bold mb-4">₹0<span className="text-base font-normal">/month</span></p>
          <ul className="space-y-2 text-gray-400">
            <li>Basic lessons & practice modes</li>
            <li>Standard analytics</li>
            <li>Achievements & leaderboard participation</li>
            <li>Community chat</li>
          </ul>
        </div>
        <div className="border border-accent-200 rounded-lg p-6 bg-surface-200 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-accent-200">Premium</h2>
          <p className="text-2xl font-bold mb-4 text-accent-200">₹499<span className="text-base font-normal text-gray-300">/month</span></p>
          <ul className="space-y-2 text-gray-400">
            <li>Everything in Free</li>
            <li>Advanced analytics & heatmaps</li>
            <li>AI-driven personalized lessons</li>
            <li>Access to all coding modes</li>
            <li>Priority multiplayer race matching</li>
            <li>Premium badges & themes</li>
          </ul>
          <div className="mt-6">
            {subscribed ? (
              <p className="text-green-400 font-medium">You are now subscribed!</p>
            ) : (
              <Button variant="primary" onClick={handleSubscribe}>Subscribe</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}