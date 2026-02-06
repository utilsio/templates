"use server";

import {deriveAppHashHex, signRequest} from "@utilsio/react/server";

// Derive the HMAC key once at module load (expensive operation)
const appHashHex = deriveAppHashHex({
	appSecret: process.env.UTILSIO_APP_SECRET!,
	salt: process.env.UTILSIO_APP_SALT!,
});

export async function getAuthHeadersAction(input: {deviceId: string; additionalData?: string}) {
	const timestamp = Date.now();

	const signature = signRequest({
		appHashHex,
		deviceId: input.deviceId,
		appId: process.env.NEXT_PUBLIC_UTILSIO_APP_ID!,
		timestamp,
		additionalData: input.additionalData,
	});

	return {signature, timestamp: String(timestamp)};
}
