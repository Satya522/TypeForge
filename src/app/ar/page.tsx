"use client";

export default function ARPage() {
  return (
    <div className="mx-auto max-w-3xl py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Augmented Reality Typing</h1>
      <p className="text-gray-300 max-w-prose">
        Augmented Reality (AR) can make typing practice immersive and fun by
        overlaying a virtual keyboard onto your physical environment. While full
        AR support requires specialized hardware and browsers with WebXR
        capabilities, this page describes how such a feature could work in
        TypeForge.
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-300">
        <li>Use your device’s camera to display a live view of your hands and keyboard.</li>
        <li>Overlay animated finger hints onto the keys you should press.</li>
        <li>Receive real-time feedback on finger placement and timing.</li>
        <li>Explore gamified AR exercises such as popping virtual balloons by hitting the correct keys.</li>
      </ul>
      <p className="text-gray-400">
        AR training is an experimental idea and may not be supported in all browsers. It
        requires access to your device’s camera and may need additional
        permissions.
      </p>
    </div>
  );
}