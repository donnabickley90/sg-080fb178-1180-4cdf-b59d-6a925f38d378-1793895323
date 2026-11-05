import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Database, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: songs } = await supabase
        .from("songs")
        .select("*");

      const { data: albums } = await supabase
        .from("albums")
        .select("*");

      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        songs: songs ?? [],
        albums: albums ?? [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sweet-obedience-vault-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your data has been exported.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version || !data.songs || !data.albums) {
          throw new Error("Invalid backup file format");
        }

        const { error: songsError } = await supabase
          .from("songs")
          .upsert(data.songs, { onConflict: "id" });

        const { error: albumsError } = await supabase
          .from("albums")
          .upsert(data.albums, { onConflict: "id" });

        if (songsError || albumsError) {
          throw new Error("Failed to restore data");
        }

        toast({
          title: "Restore successful",
          description: "Your data has been restored.",
        });

        router.reload();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Restore failed",
          description: error.message,
        });
      }
    };
    input.click();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary">
            <Database className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-4xl font-bold">Settings</h1>

      <Alert className="border-accent/50">
        <AlertCircle className="h-4 w-4 text-accent" />
        <AlertDescription>
          Backup and restore features preserve your song and album data, but do not include uploaded files (MP3s, videos, cover art).
        </AlertDescription>
      </Alert>

      <Card className="shadow-[0_0_15px_rgba(139,92,246,0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, backup, and restore your vault data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download a JSON file containing all your songs and albums.
            </p>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Restore Data</h3>
            <p className="text-sm text-muted-foreground">
              Import a previously exported backup file. This will merge with existing data.
            </p>
            <Button
              onClick={handleImport}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore from Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}