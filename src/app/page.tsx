import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full rounded-t-lg py-12 md:py-24 lg:py-32 xl:py-36 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-900">
                Stay Updated on Your Favorite Blogs
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Get email notifications whenever your favorite blogs publish new content.
                Never miss a post from your favorite writers and websites.
              </p>
            </div>
            <div className="space-x-4 mt-6">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-md bg-navy-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 btn-primary"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 btn-secondary"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white border-t border-gray-200">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Simple, reliable, and convenient way to stay updated with the latest content from your favorite blogs.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <div className="card flex flex-col items-center space-y-3 rounded-lg border border-gray-200 p-6">
              <div className="bg-navy-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-navy-600"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add Blogs</h3>
              <p className="text-sm text-gray-600 text-center">
                Enter the URL of your favorite blogs and we&apos;ll automatically detect their RSS feeds.
              </p>
            </div>
            <div className="card flex flex-col items-center space-y-3 rounded-lg border border-gray-200 p-6">
              <div className="bg-navy-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-navy-600"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">We Monitor</h3>
              <p className="text-sm text-gray-600 text-center">
                Our system automatically checks for new posts on your subscribed blogs.
              </p>
            </div>
            <div className="card flex flex-col items-center space-y-3 rounded-lg border border-gray-200 p-6">
              <div className="bg-navy-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-navy-600"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="14" rx="2" ry="2" width="20" x="2" y="3" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Email Alerts</h3>
              <p className="text-sm text-gray-600 text-center">
                Receive timely email notifications with links to new posts as soon as they&apos;re published.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full rounded-b-lg py-12 md:py-24 lg:py-32 bg-gray-50 border-t border-gray-200">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                Ready to Get Started?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Join today and never miss another blog post from your favorite creators.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-md bg-navy-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 btn-primary"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}