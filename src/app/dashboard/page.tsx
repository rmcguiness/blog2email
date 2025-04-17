import AddBlogForm from '@/components/AddBlogForm';
import BlogList from '@/components/BlogList';
import RecentPosts from '@/components/RecentPosts';

export default function Dashboard() {
    return (
        <div className="flex flex-col items-center space-y-10">
            <h1 className="text-3xl font-bold text-gray-900">Your Blog Subscriptions</h1>

            <div className="w-full flex flex-col md:flex-row gap-8">
                {/* Sidebar with Blog Form */}
                <div className="w-full md:w-1/3">
                    <AddBlogForm />
                </div>

                {/* Main content */}
                {/* <div className="w-full md:w-2/3 flex flex-col space-y-10">
                    <BlogList />
                    <RecentPosts />
                </div> */}
            </div>
        </div>
    );
} 