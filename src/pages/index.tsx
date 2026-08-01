import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Music, Disc3, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalSongs: number;
  totalAlbums: number;
  needsWork: number;
  readyToRelease: number;
}

interface RecentSong {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalSongs: 0, totalAlbums: 0, needsWork: 0, readyToRelease: 0 });
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const { data: songs } = await supabase
        .from("songs")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });

      const { data: albums } = await supabase
        .from("albums")
        .select("id");

      const songsData = songs ?? [];
      const albumsData = albums ?? [];

      const needsWorkStatuses = ["Needs Lyrics Work", "Needs Mixing", "Needs Remixing"];
      const needsWork = songsData.filter((s) => needsWorkStatuses.includes(s.status)).length;
      const readyToRelease = songsData.filter((s) => s.status === "To Be Released").length;

      setStats({
        totalSongs: songsData.length,
        totalAlbums: albumsData.length,
        needsWork,
        readyToRelease,
      });

      setRecentSongs(songsData.slice(0, 5));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary">
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold">Your Music Vault</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/songs/new")}
            className="shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Song
          </Button>
          <Button
            onClick={() => router.push("/albums/new")}
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Album
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSongs}</div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Albums</CardTitle>
            <Disc3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAlbums}</div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Work</CardTitle>
            <AlertCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.needsWork}</div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Release</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.readyToRelease}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Songs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSongs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No songs yet. Start by adding your first song!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSongs.map((song) => (
                <Link
                  key={song.id}
                  href={`/songs/${song.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-border/50"
                >
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.status}</p>
                  </div>
                  <Music className="h-4 w-4 text-primary" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}