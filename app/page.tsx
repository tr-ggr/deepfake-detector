import DeepfakeDetector from "@/components/deepfake-detector";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <DeepfakeDetector />
    </main>
  );
}
