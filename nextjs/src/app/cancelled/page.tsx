import Link from "next/link";

export default function CancelledPage() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="mb-4 text-3xl font-bold text-orange-600">
					Subscription Cancelled
				</h1>
				<p className="mb-6 text-gray-600">
					You cancelled the subscription process.
				</p>
				<Link
					href="/"
					className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Back to Home
				</Link>
			</div>
		</div>
	);
}
