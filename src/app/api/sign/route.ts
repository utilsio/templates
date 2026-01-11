import {NextRequest, NextResponse} from "next/server";
import {deriveAppHashHex, nowUnixSeconds, signRequest} from "@utilsio/react/server";

// Derive the hash once at module load time
const appHashHex = deriveAppHashHex({
	appSecret: process.env.UTILSIO_APP_SECRET!,
	salt: process.env.UTILSIO_APP_SALT!,
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {deviceId, additionalData} = body as {deviceId: string; additionalData?: string};

		if (!deviceId) {
			return NextResponse.json({error: "deviceId is required"}, {status: 400});
		}

		const appId = process.env.NEXT_PUBLIC_UTILSIO_APP_ID!;
		const timestamp = nowUnixSeconds();

		const signature = signRequest({
			appHashHex,
			deviceId,
			appId,
			timestamp,
			additionalData,
		});

		return NextResponse.json({
			signature,
			timestamp: String(timestamp),
		});
	} catch (error) {
		console.error("Sign request error:", error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : "Failed to sign request"},
			{status: 500}
		);
	}
}
