import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewAlbumPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

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
      const albumId = crypto.randomUUID();
      let coverUrl = null;

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "cover-art", `${user.id}/albums/${albumId}/cover.jpg`);
      }

      const { error } = await supabase.from("albums").insert({
        id: albumId,
        user_id: user.id,
        title,
        cover_art_url: coverUrl,
      });

      if (error) throw error;

      toast({
        title: "Album created",
        description: "Your album has been added to the vault.",
      });

      router.push(`/albums/${albumId}`);
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/albums">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-4xl font-bold">Add New Album</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <CardHeader>
            <CardTitle>Album Details</CardTitle>
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

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Album"}
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