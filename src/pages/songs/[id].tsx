import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Save, Trash2, Music, Video, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Song {
  id: string;
  title: string;
  lyrics: string | null;
  status: string;
  album_id: string | null;
  mp3_url: string | null;
  video_url: string | null;
  cover_art_url: string | null;
}

export default function SongPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [song, setSong] = useState<Song | null>(null);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [status, setStatus] = useState("Needs Lyrics Work");
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const statuses = ["Needs Lyrics Work", "Needs Mixing", "Needs Remixing", "To Be Released", "Released"];

  useEffect(() => {
    if (user && id) {
      loadSong();
      loadAlbums();
    }
  }, [user, id]);

  const loadSong = async () => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setSong(data);
      setTitle(data.title);
      setLyrics(data.lyrics ?? "");
      setStatus(data.status);
      setAlbumId(data.album_id);
    } catch (error) {
      console.error("Error loading song:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load song.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    const { data } = await supabase
      .from("albums")
      .select("id, title")
      .order("title");
    setAlbums(data ?? []);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !song) return;

    setSaving(true);
    try {
      let mp3Url = song.mp3_url;
      let videoUrl = song.video_url;
      let coverUrl = song.cover_art_url;

      if (mp3File) {
        mp3Url = await uploadFile(mp3File, "audio", `${user.id}/${song.id}/audio.mp3`);
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "videos", `${user.id}/${song.id}/video.mp4`);
      }

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "cover-art", `${user.id}/${song.id}/cover.jpg`);
      }

      const { error } = await supabase
        .from("songs")
        .update({
          title,
          lyrics,
          status,
          album_id: albumId,
          mp3_url: mp3Url,
          video_url: videoUrl,
          cover_art_url: coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", song.id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "Your song has been updated.",
      });

      loadSong();
      setMp3File(null);
      setVideoFile(null);
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

  const handleDelete = async () => {
    if (!song) return;

    try {
      const { error } = await supabase.from("songs").delete().eq("id", song.id);

      if (error) throw error;

      toast({
        title: "Song deleted",
        description: "The song has been removed from your vault.",
      });

      router.push("/songs");
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
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading song...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Song not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/songs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">{song.title}</h1>
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
          <CardTitle>Song Details</CardTitle>
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Select value={albumId ?? "none"} onValueChange={(v) => setAlbumId(v === "none" ? null : v)}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Album</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={12}
              className="bg-secondary font-mono text-sm whitespace-pre-wrap"
              placeholder="Enter your lyrics here..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Files</h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>MP3 File</Label>
                {song.mp3_url && (
                  <div className="flex items-center gap-2 p-2 bg-secondary rounded text-sm mb-2">
                    <Music className="h-4 w-4 text-primary" />
                    <a href={song.mp3_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex-1 truncate">
                      Current file
                    </a>
                  </div>
                )}
                <Input
                  type="file"
                  accept="audio/mpeg,audio/mp3"
                  onChange={(e) => setMp3File(e.target.files?.[0] ?? null)}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label>Video File</Label>
                {song.video_url && (
                  <div className="flex items-center gap-2 p-2 bg-secondary rounded text-sm mb-2">
                    <Video className="h-4 w-4 text-primary" />
                    <a href={song.video_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex-1 truncate">
                      Current file
                    </a>
                  </div>
                )}
                <Input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label>Cover Art</Label>
                {song.cover_art_url && (
                  <div className="flex items-center gap-2 p-2 bg-secondary rounded text-sm mb-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <a href={song.cover_art_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex-1 truncate">
                      Current file
                    </a>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="bg-secondary"
                />
              </div>
            </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{song.title}" from your vault. This action cannot be undone.
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