import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera uma pasta enxuta (.next/standalone) só com o que o servidor precisa: é o que vai na imagem Docker.
  output: "standalone",
  // O Application Insights precisa ser carregado de fora do bundle para conseguir monitorar o app.
  serverExternalPackages: ["@azure/monitor-opentelemetry"],
};

export default nextConfig;
