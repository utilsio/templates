import type {NextConfig} from "next";

const nextConfig: NextConfig = {
	reactCompiler: false,
	turbopack: {
		root: __dirname,
	},
};

export default nextConfig;
