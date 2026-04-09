"use client";
import Image from 'next/image';

export default function PosturePage() {
  return (
    <div className="mx-auto max-w-3xl py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Ergonomics & Posture</h1>
      <p className="text-gray-300 max-w-prose">
        Proper typing posture is essential for preventing strain and injury. Follow these guidelines for a healthy typing practice.
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-300">
        <li>Keep your back straight and shoulders relaxed.</li>
        <li>Position your elbows at a 90° angle.</li>
        <li>Align your wrists with your forearms, avoiding bending.</li>
        <li>Use a chair with lumbar support and adjust the height so your feet rest flat on the floor.</li>
        <li>Take regular breaks to stretch and rest your hands and eyes.</li>
        <li>Consider an ergonomic keyboard and mouse for additional comfort.</li>
      </ul>
      <div className="mt-6">
        <Image
          src="https://images.pexels.com/photos/4636517/pexels-photo-4636517.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          alt="Proper typing posture"
          width={1024}
          height={576}
          className="rounded-lg border border-surface-300"
        />
      </div>
    </div>
  );
}