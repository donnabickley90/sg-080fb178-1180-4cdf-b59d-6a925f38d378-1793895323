import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Music, Search } from "lucide-react";
import Link from "next/link";

interface Song {
  id: string;
  title: string;
  status: string;
  album_id: string | null;
  albums: { title: string } | null;
}

interface Album {
  id: string;
  title: string;
}

export default function SongsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAlbum, setFilterAlbum] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
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
      const { data: songsData } = await supabase
        .from("songs")
        .select("id, title, status, album_id, albums(title)")
        .order("created_at", { ascending: false });

      const { data: albumsData } = await supabase
        .from("albums")
        .select("id, title")
        .order("title");

      setSongs(songsData ?? []);
      setAlbums(albumsData ?? []);
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAlbum = filterAlbum === "all" || song.album_id === filterAlbum || (filterAlbum === "none" && !song.album_id);
    const matchesStatus = filterStatus === "all" || song.status === filterStatus;
    return matchesSearch && matchesAlbum && matchesStatus;
  });

  const statuses = ["Needs Lyrics Work", "Needs Mixing", "Needs Remixing", "To Be Released", "Released"];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary">
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold">Songs</h1>
        <Button
          onClick={() => router.push("/songs/new")}
          className="shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Song
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary"
          />
        </div>

        <Select value={filterAlbum} onValueChange={setFilterAlbum}>
          <SelectTrigger className="bg-secondary">
            <SelectValue placeholder="All Albums" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Albums</SelectItem>
            <SelectItem value="none">No Album</SelectItem>
            {albums.map((album) => (
              <SelectItem key={album.id} value={album.id}>
                {album.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-secondary">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSongs.length === 0 ? (
        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardContent className="text-center py-12">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">
              {songs.length === 0 ? "No songs yet. Start by adding your first song!" : "No songs match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSongs.map((song) => (
            <Link key={song.id} href={`/songs/${song.id}`}>
              <Card className="h-full transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Music className="h-5 w-5 text-primary" />
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {song.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{song.title}</h3>
                  {song.albums && (
                    <p className="text-sm text-muted-foreground">{song.albums.title}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}