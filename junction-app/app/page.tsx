import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Hackathon App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build amazing things faster with our scaffold. Authentication, database, and UI components ready to go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth"
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Authentication Ready
            </h3>
            <p className="text-gray-600">
              Firebase authentication with email/password and Google sign-in out of the box.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Database Integration
            </h3>
            <p className="text-gray-600">
              Firestore database configured and ready for your data models.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Modern Stack
            </h3>
            <p className="text-gray-600">
              Built with Next.js 15, TypeScript, and Tailwind CSS for the best developer experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
