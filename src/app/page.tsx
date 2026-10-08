import DemoApp from "@/components/demo-app";
import { networkInterfaces } from "node:os";
export default function Home() {
  const localAddress =
    process.env.NODE_ENV === "development"
      ? Object.values(networkInterfaces())
          .flat()
          .find(
            (ip) =>
              ip?.family === "IPv4" &&
              !ip.internal &&
              /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip.address),
          )?.address
      : undefined;
  return (
    <DemoApp
      networkUrl={
        localAddress ? `http://${localAddress}:3000/ponto` : undefined
      }
    />
  );
}
