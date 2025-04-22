export default function About() {
    return (
        <div className="flex flex-col items-center">
            <section className="w-full max-w-4xl md:py-8">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-800">
                            About Blog2Email
                        </h1>
                        <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                            Keeping you connected to your favorite content creators
                        </p>
                    </div>

                    <div className="mt-8 space-y-4 text-gray-600">
                        <div className="card p-8 rounded-lg border border-gray-200">
                            <p>
                                Blog2Email is a service designed to help you stay updated with the latest content from your favorite blogs and websites. In a world where content is constantly being published, it can be challenging to keep track of all the blogs you follow. Our mission is to simplify this process and ensure you never miss important updates.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mt-6">How It Works</h2>
                        <div className="card p-6 rounded-lg border border-gray-200">
                            <p>
                                Our platform uses RSS technology to monitor blog updates. When you add a blog to your subscriptions, we periodically check for new content. As soon as a new post is published, we send you an email notification with the post&apos;s title, a brief description, and a direct link to read the full article.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mt-6">Key Features</h2>
                        <div className="card p-6 rounded-lg border border-gray-200">
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Automatic feed detection from blog URLs</li>
                                <li>Real-time notifications for new content</li>
                                <li>Clean, summarized email format</li>
                                <li>Easy subscription management</li>
                                <li>Support for most major blog platforms</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mt-6">Our Technology</h2>
                        <div className="card p-6 rounded-lg border border-gray-200">
                            <p>
                                Blog2Email is built using modern web technologies including Next.js, React, and TailwindCSS for the frontend, with Supabase providing authentication and database services. We prioritize reliability and performance to ensure you receive timely notifications about new content.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mt-6">Get Started</h2>
                        <div className="card p-6 rounded-lg border border-gray-200">
                            <p>
                                Ready to stay updated with your favorite blogs? <a href="/signup" className="text-navy-600 hover:text-navy-800 hover:underline font-medium">Sign up</a> for a free account today and start adding your favorite blogs to your subscription list.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}