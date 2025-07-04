import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity, Heart, Calendar, Target, Settings, Home } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthTracker - Your Personal Health Dashboard",
  description: "Track your health metrics, activities, nutrition, and wellness goals",
};

const navigationItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/activities", icon: Activity, label: "Activities" },
  { href: "/nutrition", icon: Heart, label: "Nutrition" },
  { href: "/vitals", icon: Activity, label: "Vitals" },
  { href: "/goals", icon: Target, label: "Goals" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white min-h-screen`}
      >
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-8 w-8 text-emerald-400" />
                  <span className="text-xl font-bold text-white">HealthTracker</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 z-50">
          <div className="flex justify-around items-center h-16 px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
