import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Daily Learning App</h1>
        <p className="text-gray-600 mb-8">Learn something new every day</p>
        <div className="space-x-4">
          <Link 
            href="/login" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Login
          </Link>
          <Link 
            href="/topics" 
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            View Topics
          </Link>
        </div>
      </div>
    </div>
  );
}