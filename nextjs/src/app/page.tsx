"use client";

import {useUtilsio} from "@utilsio/react/client";
import {useCallback, useState} from "react";

function SubscribeButton() {
	const {loading, user, currentSubscription, error, redirectToConfirm, cancelSubscription} = useUtilsio();
	const [cancelError, setCancelError] = useState<string | null>(null);
	const [cancelling, setCancelling] = useState(false);

	const handleSubscribe = useCallback(() => {
		const appId = process.env.NEXT_PUBLIC_UTILSIO_APP_ID!;
		const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

		redirectToConfirm({
			appId,
			appName: "Demo App",
			amountPerDay: "1", // 1 POL per day (~30 POL per month)
			appUrl,
			nextSuccess: `${appUrl}/success`,
			nextCancelled: `${appUrl}/cancelled`,
		});
	}, [redirectToConfirm]);

	const handleCancel = useCallback(async () => {
		if (!currentSubscription) return;
		if (!confirm("Are you sure you want to cancel your subscription?")) return;

		setCancelError(null);
		setCancelling(true);

		try {
			await cancelSubscription([currentSubscription.id]);
			// refresh() is called inside cancelSubscription, component re-renders automatically
		} catch (err) {
			setCancelError(err instanceof Error ? err.message : String(err));
		} finally {
			setCancelling(false);
		}
	}, [currentSubscription, cancelSubscription]);

	if (currentSubscription) {
		const amountPerDay = parseFloat(currentSubscription.amountPerDay);
		const amountPerMonth = (amountPerDay * 30).toFixed(6);
		const startDate = new Date(currentSubscription.createdAt).toLocaleDateString();

		return (
			<div className="flex items-center justify-center min-h-dvh">
				<div className="text-center max-w-md">
					<h1 className="mb-6 text-2xl font-bold">Active Subscription</h1>

					{user && (
						<div className="mb-6 p-4 border border-white rounded-lg text-left space-y-2">
							<h2 className="font-semibold text-lg mb-2">User Info</h2>
							<div className="text-sm">
								<span className="font-semibold">Email:</span> {user.email || "N/A"}
							</div>
							{user.phone && (
								<div className="text-sm">
									<span className="font-semibold">Phone:</span> {user.phone}
								</div>
							)}
							<div className="text-sm">
								<span className="font-semibold">User ID:</span> {user.id}...
							</div>
						</div>
					)}

					<div className="mb-6 p-4 border border-white rounded-lg text-left space-y-2">
						<h2 className="font-semibold text-lg mb-2">Subscription</h2>
						<div>
							<span className="font-semibold">Per day:</span> {currentSubscription.amountPerDay} POL
						</div>
						<div>
							<span className="font-semibold">Per month:</span> ~{amountPerMonth} POL
						</div>
						<div>
							<span className="font-semibold">Started:</span> {startDate}
						</div>
					</div>

					<button
						onClick={handleCancel}
						disabled={cancelling}
						className="w-full px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{cancelling ? "Cancelling..." : "Cancel Subscription"}
					</button>

					{cancelError && (
						<p className="mt-3 text-sm text-red-600">{cancelError}</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-dvh">
			<div className="text-center max-w-md">
				<h1 className="mb-6 text-3xl font-bold">utilsio React SDK Demo</h1>

				<p className="mb-8 text-gray-600">
					Subscribe to this demo app for 1 POL per day
				</p>
				<button
					onClick={handleSubscribe}
					className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Subscribe
				</button>
			</div>
		</div>
	);
}

export default function HomePage() {
	return <SubscribeButton />;
}
