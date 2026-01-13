"use client";

import {UtilsioProvider, useUtilsio} from "@utilsio/react/client";
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
			amountPerDay: "0.033333", // 1 POL per month
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

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="mb-4 text-lg">Loading...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="mb-4 text-lg text-red-500">Error: {error}</div>
				</div>
			</div>
		);
	}

	if (!user) {
		const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
		const utilsioUrl = process.env.NEXT_PUBLIC_UTILSIO_APP_URL!;
		const loginUrl = `${utilsioUrl}/auth?next=${encodeURIComponent(appUrl)}`;

		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
					<p className="mb-4 text-gray-600">
						You need to be logged in to utilsio to subscribe.
					</p>
					<a
						href={loginUrl}
						className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
					>
						Log In to utilsio
					</a>
				</div>
			</div>
		);
	}

	if (currentSubscription) {
		const amountPerDay = parseFloat(currentSubscription.amountPerDay);
		const amountPerMonth = (amountPerDay * 30).toFixed(6);
		const startDate = new Date(currentSubscription.createdAt).toLocaleDateString();

		return (
			<div className="flex items-center justify-center min-h-screen">
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
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center max-w-md">
				<h1 className="mb-6 text-3xl font-bold">utilsio React SDK Demo</h1>
				
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

				<p className="mb-8 text-gray-600">
					Subscribe to this demo app for 1 POL per month
				</p>
				<button
					onClick={handleSubscribe}
					className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Subscribe (1 POL/month)
				</button>
			</div>
		</div>
	);
}

async function getAuthHeaders({
	deviceId,
	additionalData,
}: {
	deviceId: string;
	additionalData?: string;
}) {
	const response = await fetch("/api/sign", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({deviceId, additionalData}),
	});

	if (!response.ok) {
		throw new Error(`Failed to get auth headers: ${response.statusText}`);
	}

	return response.json();
}

export default function HomePage() {
	return (
		<UtilsioProvider
			utilsioBaseUrl={process.env.NEXT_PUBLIC_UTILSIO_APP_URL!}
			appId={process.env.NEXT_PUBLIC_UTILSIO_APP_ID!}
			getAuthHeadersAction={getAuthHeaders}
		>
			<SubscribeButton />
		</UtilsioProvider>
	);
}
