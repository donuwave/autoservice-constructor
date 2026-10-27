/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  // Форма читает clients/*.json во время работы, файлы нужно приложить к серверной функции
  outputFileTracingIncludes: { '/api/booking': ['./clients/**/*.json'] },
};

export default nextConfig;
