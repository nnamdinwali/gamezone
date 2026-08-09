import { Gamepad2, Trophy, Wallet, Upload, User, LayoutDashboard, BarChart3 } from "lucide-react";

export const navLinks = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/games", label: "All Games", icon: Gamepad2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/earnings", label: "Earnings", icon: Wallet },
  { href: "/upload", label: "Upload Game", icon: Upload },
  { href: "/dashboard", label: "Profile", icon: User },
  { href: "/dashboard", label: "Platform Stats", icon: BarChart3 },
];
