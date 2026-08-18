import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { usePreferences } from "@/features/recommendations/hooks/usePreferences";
import PreferenceForm from "@/features/recommendations/components/PreferenceForm";

export default function PreferencesPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data, isLoading, save } = usePreferences();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl py-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Your preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell APHR what matters to you. We use these to rank hostels.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 md:p-6">
          {isLoading || !data ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PreferenceForm
              initial={data}
              saving={save.isPending}
              onSave={async (p) => { await save.mutateAsync(p); navigate("/recommendations"); }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}