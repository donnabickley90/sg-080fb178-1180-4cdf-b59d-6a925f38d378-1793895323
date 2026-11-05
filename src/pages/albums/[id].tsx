import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2, Plus, X, Disc3, Play } from "lucide-react";
import Link from "next/link";
import { FloatingAudioPlayer } from "@/components/FloatingAudioPlayer";

interface Album {
  id: string;
  title: string;
  cover_art_url: string | null;
}

interface AlbumSong {
  id: string;
  title: string;
  artist: string | null;
  mp3_url: string | null;
}

interface AvailableSong {
  id: string;
  title: string;
}

export default function AlbumPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [album, setAlbum] = useState<Album | null>(null);
  const [title, setTitle] = useState("");
  const [albumSongs, setAlbumSongs] = useState<AlbumSong[]>([]);
  const [availableSongs, setAvailableSongs] = useState<AvailableSong[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user && id) {
      loadAlbum();
      loadAvailableSongs();
    }
  }, [user, id]);

  const loadAlbum = async () => {
    try {
      const albumId = Array.isArray(id) ? id[0] : id;
      if (!albumId) return;

      const { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();

      if (albumError) throw albumError;

      const { data: songsData } = await supabase
        .from("songs")
        .select("id, title, artist, mp3_url")
        .eq("album_id", albumId)
        .order("title");

      setAlbum(albumData);
      setTitle(albumData.title);
      setAlbumSongs(songsData ?? []);
    } catch (error) {
      console.error("Error loading album:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load album.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSongs = async () => {
    const { data } = await supabase
      .from("songs")
      .select("id, title")
      .is("album_id", null)
      .order("title");
    setAvailableSongs(data ?? []);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !album) return;

    setSaving(true);
    try {
      let coverUrl = album.cover_art_url;

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "cover-art", `${user.id}/albums/${album.id}/cover.jpg`);
      }

      const { error } = await supabase
        .from("albums")
        .update({
          title,
          cover_art_url: coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", album.id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "Your album has been updated.",
      });

      loadAlbum();
      setCoverFile(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSong = async () => {
    if (!selectedSongId || !album) return;

    try {
      const { error } = await supabase
        .from("songs")
        .update({ album_id: album.id })
        .eq("id", selectedSongId);

      if (error) throw error;

      setSelectedSongId("");
      loadAlbum();
      loadAvailableSongs();

      toast({
        title: "Song added",
        description: "The song has been added to this album.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from("songs")
        .update({ album_id: null })
        .eq("id", songId);

      if (error) throw error;

      loadAlbum();
      loadAvailableSongs();

      toast({
        title: "Song removed",
        description: "The song has been removed from this album.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!album) return;

    try {
      const { error } = await supabase.from("albums").delete().eq("id", album.id);

      if (error) throw error;

      toast({
        title: "Album deleted",
        description: "The album has been removed from your vault.",
      });

      router.push("/albums");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary">
            <Disc3 className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading album...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Album not found.</p>
      </div>
    );
  }

  const songsInAlbum = new Set(albumSongs.map((s) => s.id));
  const filteredAvailableSongs = availableSongs.filter((s) => !songsInAlbum.has(s.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/albums">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">{album.title}</h1>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
        <CardHeader>
          <CardTitle>Album Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label>Cover Art</Label>
            {album.cover_art_url && (
              <div className="mb-4">
                <img 
                  src={album.cover_art_url} 
                  alt={`${album.title} cover`}
                  className="w-full max-w-xs rounded-lg shadow-lg"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="bg-secondary"
            />
            {coverFile && (
              <p className="text-xs text-muted-foreground">Selected: {coverFile.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
        <CardHeader>
          <CardTitle>Songs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedSongId} onValueChange={setSelectedSongId}>
              <SelectTrigger className="bg-secondary flex-1">
                <SelectValue placeholder="Select a song" />
              </SelectTrigger>
              <SelectContent>
                {filteredAvailableSongs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddSong} disabled={!selectedSongId}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {albumSongs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No songs in this album yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {albumSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setCurrentSongIndex(index)}
                    disabled={!song.mp3_url}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Link href={`/songs/${song.id}`} className="flex-1 hover:text-primary transition-colors">
                    {song.title}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveSong(song.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentSongIndex !== null && albumSongs.length > 0 && (
        <FloatingAudioPlayer
          playlist={albumSongs}
          currentIndex={currentSongIndex}
          onClose={() => setCurrentSongIndex(null)}
          onSongChange={setCurrentSongIndex}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{album.title}" from your vault. Songs in this album will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}