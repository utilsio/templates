import type {NextConfig} from "next";
import path from "path";

const nextConfig: NextConfig = {
	reactCompiler: false,
	turbopack: {
		// Point to monorepo root where dependencies are hoisted
		root: path.resolve(__dirname, "../../"),
	},
};

export default nextConfig;
