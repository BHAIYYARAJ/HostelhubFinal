import { useAppStore } from "@/store/useAppStore";
import { useHostels } from "@/hooks/useHostels";
import Navbar from "@/components/Navbar";
import HostelCard from "@/components/HostelCard";
import Footer from "@/components/Footer";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";

const Favorites = () => {
  const favorites = useAppStore((s) => s.favorites);
  const { data: hostels = [], isLoading } = useHostels();

  const saved = hostels.filter((h) => favorites.includes(h.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 md:py-16">
        <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Saved hostels</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${saved.length} hostel${saved.length !== 1 ? "s" : ""} saved`}
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : saved.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((h, i) => (
              <HostelCard key={h.id} hostel={h} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-secondary p-6">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No saved hostels yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart icon on any listing to save it here
            </p>
            <Link to="/" className="mt-4 text-sm font-medium text-primary hover:underline">
              Explore hostels
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
