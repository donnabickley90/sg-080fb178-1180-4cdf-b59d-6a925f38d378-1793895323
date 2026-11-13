import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Music, Disc3, Settings, LogOut, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mobileView");
    if (saved) setMobileView(saved === "true");
  }, []);

  const toggleMobileView = () => {
    const newValue = !mobileView;
    setMobileView(newValue);
    localStorage.setItem("mobileView", String(newValue));
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Songs", href: "/songs", icon: Music },
    { name: "Albums", href: "/albums", icon: Disc3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className={cn("min-h-screen", mobileView ? "max-w-[430px] mx-auto" : "")}>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className={cn("sticky top-0 z-50 bg-card border-b border-border", mobileView ? "block" : "md:hidden")}>
          <div className={cn("flex items-center justify-between", mobileView ? "px-3 py-2.5" : "p-4")}>
            <h1 className={cn("font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", mobileView ? "text-lg" : "text-xl")}>
              Sweet Obedience Vault
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className={cn("text-muted-foreground hover:text-foreground", mobileView ? "h-8 w-8" : "")}
            >
              <LogOut className={cn(mobileView ? "h-4 w-4" : "h-5 w-5")} />
            </Button>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className={cn("bg-card border-r border-border", mobileView ? "hidden" : "hidden md:flex md:flex-col md:w-64")}>
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sweet Obedience Vault
            </h1>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={toggleMobileView}
            >
              <Smartphone className="h-5 w-5" />
              Mobile View
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className={cn("container", mobileView ? "py-3 px-3" : "py-6 md:py-8")}>{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className={cn("sticky bottom-0 z-50 bg-card border-t border-border", mobileView ? "block" : "md:hidden")}>
          <div className={cn("flex items-center justify-around", mobileView ? "px-2 py-1.5" : "p-2")}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg transition-colors min-w-[60px]",
                    mobileView ? "px-2 py-1.5" : "px-3 py-2",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn(mobileView ? "h-5 w-5" : "h-5 w-5")} />
                  <span className={cn("font-medium", mobileView ? "text-[10px]" : "text-xs")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile View Toggle (Fixed Position for Desktop) */}
      {!mobileView && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 hidden md:flex shadow-lg"
          onClick={toggleMobileView}
          title="Toggle Mobile View"
        >
          <Smartphone className="h-5 w-5" />
        </Button>
      )}

      {/* Exit Mobile View (Fixed Position) */}
      {mobileView && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          onClick={toggleMobileView}
          title="Exit Mobile View"
        >
          <Monitor className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}