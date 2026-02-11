import {NextRequest, NextResponse} from "next/server";
import {deriveAppHashHex, signRequest} from "@utilsio/react/server";

// Constants
const TIMESTAMP_VALIDITY_WINDOW_SECONDS = 60; // 60 seconds

// Derive the hash once at module load time
const appHashHex = deriveAppHashHex({
	appSecret: process.env.UTILSIO_APP_SECRET!,
	salt: process.env.UTILSIO_APP_SALT!,
});

/**
 * POST /api/signature-callback
 * Server-to-server callback from utilsio.dev for Safari-compatible flows
 *
 * This endpoint receives deviceId and request params from utilsio.dev
 * and generates a signature using the app secret.
 *
 * Used for both:
 * - Subscribe flow (additionalData = amountPerDay)
 * - Cancel flow (additionalData = sorted subscriptionIds joined by comma)
 *
 * Security:
 * - Validates X-utilsio-Origin header
 * - Validates timestamp is recent (within 60 seconds)
 * - Requires HTTPS in production
 *
 * Body: {
 *   deviceId: string,
 *   appId: string,
 *   additionalData: string,
 *   timestamp: number
 * }
 *
 * Response: {
 *   signature: string,
 *   timestamp: number
 * }
 */
export async function POST(req: NextRequest) {
	try {
		// Verify request origin
		const origin = req.headers.get("X-utilsio-Origin");
		if (origin !== "utilsio.dev") {
			console.error("Invalid origin header:", origin);
			return NextResponse.json({error: "Unauthorized origin"}, {status: 403});
		}

		// Require HTTPS in production
		const isProduction = process.env.NODE_ENV === "production";
		const protocol = req.headers.get("x-forwarded-proto") || "http";

		if (isProduction && protocol !== "https") {
			console.error("HTTPS required in production");
			return NextResponse.json({error: "HTTPS required"}, {status: 403});
		}

		// Parse and validate request body
		const body = await req.json();
		const {deviceId, appId, additionalData, timestamp} = body as {
			deviceId: string;
			appId: string;
			additionalData: string;
			timestamp: number;
		};

		if (!deviceId || !appId || !additionalData || !timestamp) {
			return NextResponse.json(
				{error: "Missing required fields: deviceId, appId, additionalData, timestamp"},
				{status: 400}
			);
		}

		// Validate timestamp is recent (within 60 seconds)
		const now = Math.floor(Date.now() / 1000);
		const timestampAge = Math.abs(now - timestamp);
		if (timestampAge > TIMESTAMP_VALIDITY_WINDOW_SECONDS) {
			console.error("Timestamp too old or in future:", {timestamp, now, age: timestampAge});
			return NextResponse.json({error: "Invalid timestamp"}, {status: 400});
		}

		// Verify appId matches our app
		const expectedAppId = process.env.NEXT_PUBLIC_UTILSIO_APP_ID!;
		if (appId !== expectedAppId) {
			console.error("AppId mismatch:", {expected: expectedAppId, received: appId});
			return NextResponse.json({error: "Invalid appId"}, {status: 403});
		}

		// Generate signature
		const signature = signRequest({
			appHashHex,
			deviceId,
			appId,
			timestamp,
			additionalData,
		});

		console.log("Generated signature for server-to-server callback:", {
			appId,
			timestamp,
		});

		return NextResponse.json({
			signature,
			timestamp,
		});
	} catch (error) {
		console.error("Signature callback error:", error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : "Failed to generate signature"},
			{status: 500}
		);
	}
}
