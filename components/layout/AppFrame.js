"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Bus,
  LayoutDashboard,
  MapPinned,
  Route,
  User,
  LogOut,
  LogIn,
  Menu,
  Shield,
  Truck,
  History,
  MessageSquare,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";
import NotificationBell from "./NotificationBell";

function getThemeByRole(role) {
  if (role === "admin") {
    return {
      name: "Admin",
      colors: {
        primary: "blue",
        text: "text-blue-400",
        bgHover: "hover:bg-blue-500/10",
        textHover: "hover:text-blue-400",
        activeBg: "bg-blue-500/10",
        border: "border-blue-500/20",
        badge: "text-blue-500 bg-blue-500/10 border border-blue-500/20",
        iconContainer: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20",
        ring: "ring-blue-500/10"
      }
    };
  }
  if (role === "driver") {
    return {
      name: "Driver",
      colors: {
        primary: "lime",
        text: "text-[#39FF14]",
        bgHover: "hover:bg-[#39FF14]/10",
        textHover: "hover:text-[#39FF14]",
        activeBg: "bg-[#39FF14]/10",
        border: "border-[#39FF14]/20",
        badge: "text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/20",
        iconContainer: "bg-[#39FF14]/10 text-[#39FF14] group-hover:bg-[#39FF14]/20",
        ring: "ring-[#39FF14]/10"
      }
    };
  }
  return {
    name: "Student",
    colors: {
      primary: "emerald",
      text: "text-emerald-400",
      bgHover: "hover:bg-emerald-500/10",
      textHover: "hover:text-emerald-400",
      activeBg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      badge: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20",
      iconContainer: "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20",
      ring: "ring-emerald-500/10"
    }
  };
}

function getInitials(name, email) {
  const source = `${name || email || "U"}`.trim();
  return source
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function buildNav(role) {
  if (role === "driver") {
    return [
      { href: "/", label: "Home", icon: LayoutDashboard },
      { href: "/driver", label: "My Trip", icon: Truck },
      { href: "/dhistory", label: "Trip History", icon: History },
      { href: "/driver/profile", label: "Profile", icon: User },
    ];
  }

  const base = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    
  ];

  if (role === "admin") {
    base.push(
      { href: "/admin", label: "Admin Console", icon: Shield },
      { href: "/admin/profile", label: "Profile", icon: User }
    );
  }

  return base;
}

    </nav>
  );
}

function MobileBottomNav({ navItems, pathname, theme }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-3 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                active ? theme.colors.text : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                active && `${theme.colors.activeBg} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
              )}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Reusable Login Dropdown
function DemoLoginDropdown({ theme }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-slate-800",
          theme.colors.bgHover,
          theme.colors.textHover,
          "text-slate-300",
          isOpen && "bg-slate-800"
        )}
      >
        <LogIn size={16} />
        Log In
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Invisible overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-black/80 z-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1">
            Sign In As
          </div>
          <Link 
            href="/login?role=student"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors text-left"
          >
            <User size={14} /> Student
          </Link>
          <Link 
            href="/login?role=driver"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 rounded-lg transition-colors text-left"
          >
            <Truck size={14} /> Driver
          </Link>
          <Link 
            href="/login?role=admin"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg transition-colors text-left"
          >
            <Shield size={14} /> Admin
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AppFrame({ session, children, title, subtitle, variant = "app" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isTripPage = pathname === "/driver";
  const [scrolled, setScrolled] = useState(false);
  const role = session?.user?.role || "student";
  const navItems = buildNav(role);
  const theme = getThemeByRole(role);

  useEffect(() => {
    if (isTripPage) {
      setScrolled(false);
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTripPage]);

  const content = useMemo(
    () => (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        {title ? (
          <div className="mb-10 page-fade">
            <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-slate-400 text-lg leading-relaxed">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="page-fade">{children}</div>
      </div>
    ),
    [children, subtitle, title]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200">
      {/* Top Navbar - Floating Kinetic Container */}
      <header className={cn(
        isTripPage ? "relative" : "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-500 ease-out flex justify-center",
        scrolled ? "pt-4" : "pt-0"
      )}>
        <div className={cn(
          "mx-auto flex items-center justify-between transition-all duration-700 ease-in-out px-4 md:px-6 lg:px-10 font-mono",
          scrolled 
            ? cn("w-[95%] md:w-[98%] max-w-6xl h-16 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-[#0f172a]/95 border border-[#39FF14]/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-[#39FF14]/30", 
                 role === 'admin' && 'border-indigo-500/30 ring-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]',
                 role === 'driver' && 'border-[#39FF14]/30 ring-[#39FF14]/30 shadow-[0_0_40px_rgba(57,255,20,0.1)]',
                 role === 'student' && 'border-emerald-400/30 ring-emerald-400/30 shadow-[0_0_40px_rgba(52,211,153,0.1)]'
              )
            : "w-full h-20 md:h-24 bg-transparent border-b border-white/5 backdrop-blur-md"
        )}>
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className={cn(
                "p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", 
                theme.colors.iconContainer,
                scrolled && "shadow-[0_0_15px_currentColor]"
              )}>
                <Bus size={18} className="md:w-[22px] md:h-[22px] transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-lg md:text-xl font-black tracking-tighter uppercase transition-all duration-500 text-white",
                  scrolled ? "scale-90 md:scale-95 origin-left" : "scale-100"
                )}>
                  Smart<span className={theme.colors.text}>Transit</span>
                </span>
                {session?.user && (
                   <div className="flex items-center gap-1.5 overflow-hidden h-3 md:h-4 transition-all duration-500">
                      <span className={cn("w-1 h-1 rounded-full animate-pulse", theme.colors.text.replace('text-', 'bg-'))} />
                      <span className={cn("text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em]", theme.colors.text)}>
                        {theme.name}_Active
                      </span>
                   </div>
                )}
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:block border-l border-slate-800 pl-8">
              <NavItems navItems={navItems} pathname={pathname} theme={theme} />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Notification Bell (Visible on all screen sizes) */}
            <NotificationBell />

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center gap-4">
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white leading-none">{session?.user?.name || "Guest"}</p>
                      <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-wider", theme.colors.text)}>{theme.name}</p>
                    </div>
                    <Avatar className={cn("h-9 w-9 border border-slate-700 ring-2", theme.colors.ring)}>
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                      <AvatarFallback className={cn("bg-slate-800", theme.colors.text)}>
                        {getInitials(session?.user?.name, session?.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Link href="/api/auth/signout?callbackUrl=/" className={cn("p-2 text-slate-400 rounded-lg transition-all hover:text-rose-400 hover:bg-rose-400/10")} title="Sign out">
                    <LogOut size={18} />
                  </Link>
                </>
              ) : (
                <div className="border-l border-slate-800 pl-6">
                  <DemoLoginDropdown theme={theme} />
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setOpen(true)}
                    className="border-slate-800 bg-slate-900 text-slate-400"
                  >
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] border-slate-800 bg-slate-950 p-0 flex flex-col">
                  {/* Mobile Header per theme */}
                  <div className={cn("p-6 border-b border-slate-800", theme.colors.activeBg)}>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-lg font-black italic", theme.colors.text)}>NAVIGATION</span>
                      <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className={cn("hover:bg-slate-900", theme.colors.textHover)}>
                        <X size={20} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto">
                    <NavItems 
                      navItems={navItems} 
                      pathname={pathname} 
                      orientation="vertical" 
                      onNavigate={() => setOpen(false)} 
                      theme={theme}
                    />
                  </div>

                  <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    {session?.user ? (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <Avatar className={cn("h-10 w-10 border border-slate-700 ring-2", theme.colors.ring)}>
                            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                            <AvatarFallback>{getInitials(session?.user?.name, session?.user?.email)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-white">{session?.user?.name || "User"}</p>
                            <p className={cn("text-xs", theme.colors.text)}>{theme.name}</p>
                          </div>
                        </div>
                        <Link 
                          href="/api/auth/signout?callbackUrl=/"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-slate-800"
                        >
                          <LogOut size={16} /> Sign out
                        </Link>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sign In</div>
                        <Link 
                          href="/login?role=student"
                          onClick={() => setOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-sm font-bold text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all border border-slate-800"
                        >
                          <User size={16} /> As Student
                        </Link>
                        <Link 
                          href="/login?role=driver"
                          onClick={() => setOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-sm font-bold text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 transition-all border border-slate-800"
                        >
                          <Truck size={16} /> As Driver
                        </Link>
                        <Link 
                          href="/login?role=admin"
                          onClick={() => setOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-sm font-bold text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all border border-slate-800"
                        >
                          <Shield size={16} /> As Admin
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Content Offset for Fixed Header - Kinetic Displacement */}
      {!isTripPage && <div className={cn("transition-all duration-500", scrolled ? "h-24" : "h-24")} />}

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0">
        {content}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav navItems={navItems} pathname={pathname} theme={theme} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} SmartTransit AI Dashboard. Built for Campus Excellence.
        </div>
      </footer>
    </div>
  );
}


