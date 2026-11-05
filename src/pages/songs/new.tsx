import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewSongPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [status, setStatus] = useState("Needs Lyrics Work");
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const statuses = ["Needs Lyrics Work", "Needs Mixing", "Needs Remixing", "To Be Released", "Released"];

  useState(() => {
    if (user) {
      supabase
        .from("albums")
        .select("id, title")
        .order("title")
        .then(({ data }) => setAlbums(data ?? []));
    }
  });

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const songId = crypto.randomUUID();
      let mp3Url = null;
      let videoUrl = null;
      let coverUrl = null;

      if (mp3File) {
        mp3Url = await uploadFile(mp3File, "song-files", `${user.id}/${songId}/audio.mp3`);
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "video-files", `${user.id}/${songId}/video.mp4`);
      }

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "song-covers", `${user.id}/${songId}/cover.jpg`);
      }

      const { error } = await supabase.from("songs").insert({
        id: songId,
        user_id: user.id,
        title,
        lyrics,
        status,
        album_id: albumId,
        mp3_url: mp3Url,
        video_url: videoUrl,
        cover_art_url: coverUrl,
      });

      if (error) throw error;

      toast({
        title: "Song created",
        description: "Your song has been added to the vault.",
      });

      router.push(`/songs/${songId}`);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/songs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-4xl font-bold">Add New Song</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardHeader>
            <CardTitle>Song Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
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
                className="bg-secondary font-mono text-sm"
                placeholder="Enter your lyrics here..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mp3">MP3 File</Label>
                <Input
                  id="mp3"
                  type="file"
                  accept="audio/mpeg,audio/mp3"
                  onChange={(e) => setMp3File(e.target.files?.[0] ?? null)}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Video File</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/mp4,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Art</Label>
                <Input
                  id="cover"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="bg-secondary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Song"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}