"use server";

export async function getAuthHeadersAction({
	                              deviceId,
	                              additionalData,
                              }: {
	deviceId: string;
	additionalData?: string;
}) {
	const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
	const response = await fetch(`${APP_URL}/api/sign`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ deviceId, additionalData }),
	});

	if (!response.ok) {
		throw new Error(`Failed to get auth headers: ${response.statusText}`);
	}

	return response.json();
}