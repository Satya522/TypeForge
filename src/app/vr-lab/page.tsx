import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'VR Typing Lab – TypeForge',
  description: 'Practice typing in an immersive 3D environment using virtual reality headsets.',
};

/**
 * VR Typing Lab page
 *
 * This page introduces the concept of a virtual reality typing environment. Future
 * iterations may integrate with WebXR or native VR platforms. Currently it
 * serves as a placeholder explaining the vision for immersive typing practice.
 */
export default function VRLabPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">VR Typing Lab</h1>
        <p className="text-gray-300 mb-6">
          Imagine practicing typing on a virtual keyboard floating in front of you. Our
          upcoming VR Typing Lab will leverage next‑generation hardware such as Meta
          and Apple headsets to provide an immersive 3D environment where you can
          improve your speed and accuracy while enjoying a futuristic experience.
        </p>
        <p className="text-gray-300 mb-6">
          This feature is currently in the concept stage. Once supported, you will
          be able to strap on a headset, see a holographic keyboard, and type
          through interactive lessons and games designed specifically for virtual
          reality.
        </p>
        <p className="text-gray-300">
          Stay tuned for updates! In the meantime, you can continue improving your
          skills using our traditional lessons and practice modes.
        </p>
      </main>
      <Footer />
    </>
  );
}
