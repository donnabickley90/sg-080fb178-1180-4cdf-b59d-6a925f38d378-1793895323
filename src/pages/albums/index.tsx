import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Disc3 } from "lucide-react";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  cover_art_url: string | null;
}

export default function AlbumsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadAlbums();
    }
  }, [user, authLoading, router]);

  const loadAlbums = async () => {
    try {
      const { data } = await supabase
        .from("albums")
        .select("id, title, cover_art_url")
        .order("created_at", { ascending: false });

      setAlbums(data ?? []);
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary">
            <Disc3 className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading albums...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold">Albums</h1>
        <Button
          onClick={() => router.push("/albums/new")}
          className="shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Album
        </Button>
      </div>

      {albums.length === 0 ? (
        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardContent className="text-center py-12">
            <Disc3 className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No albums yet. Start by creating your first album!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {albums.map((album) => (
            <Link key={album.id} href={`/albums/${album.id}`}>
              <Card className="overflow-hidden transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] cursor-pointer">
                <div className="aspect-square bg-secondary/50 flex items-center justify-center relative overflow-hidden">
                  {album.cover_art_url ? (
                    <img
                      src={album.cover_art_url}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Disc3 className="h-16 w-16 text-muted-foreground/30" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-center truncate">{album.title}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}