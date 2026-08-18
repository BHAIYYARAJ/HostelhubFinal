import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  images?: string[] | null;
  alt: string;
  className?: string;
  heightClassName?: string;
}

export default function HostelDetailGallery({ images, alt, className, heightClassName = "h-[320px] md:h-[480px]" }: Props) {
  const validImages = useMemo(() => (Array.isArray(images) ? images.filter((src) => typeof src === "string" && src.trim()) : []), [images]);
  const slides = validImages.length ? validImages : ["/placeholder.svg"];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(index, slides.length - 1));
    setActive(next);
    scroller.current?.scrollTo({ left: next * scroller.current.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      <div className={cn("relative overflow-hidden rounded-2xl bg-secondary", className)}>
        <div
          ref={scroller}
          className="photo-carousel flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / Math.max(e.currentTarget.clientWidth, 1)))}
        >
          {slides.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              className={cn("relative w-full shrink-0 snap-center snap-always", heightClassName)}
              onClick={() => setLightbox(index)}
              aria-label={`Open ${alt} photo ${index + 1} of ${slides.length}`}
            >
              <img
                src={src}
                alt={`${alt} photo ${index + 1} of ${slides.length}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (e.currentTarget.src.endsWith("/placeholder.svg")) return;
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {index + 1} / {slides.length}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm">
                <Expand className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); goTo(active - 1); }} disabled={active === 0} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); goTo(active + 1); }} disabled={active === slides.length - 1} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex max-w-[60%] -translate-x-1/2 gap-1 overflow-hidden rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
              {slides.map((_, index) => (
                <button key={index} type="button" aria-label={`Show photo ${index + 1}`} onClick={() => goTo(index)} className={cn("h-1.5 rounded-full transition-all", index === active ? "w-5 bg-white" : "w-1.5 bg-white/60")} />
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-6xl border-none bg-black/95 p-2 text-white sm:p-4">
          <DialogTitle className="sr-only">{alt} photo gallery</DialogTitle>
          {lightbox !== null && (
            <div className="relative flex min-h-[60vh] items-center justify-center">
              <img src={slides[lightbox]} alt={`${alt} photo ${lightbox + 1}`} className="max-h-[80vh] w-full object-contain" onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }} />
              {slides.length > 1 && (
                <>
                  <button type="button" aria-label="Previous enlarged photo" onClick={() => setLightbox(Math.max(0, lightbox - 1))} disabled={lightbox === 0} className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white disabled:opacity-30"><ChevronLeft /></button>
                  <button type="button" aria-label="Next enlarged photo" onClick={() => setLightbox(Math.min(slides.length - 1, lightbox + 1))} disabled={lightbox === slides.length - 1} className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white disabled:opacity-30"><ChevronRight /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold">{lightbox + 1} / {slides.length}</div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
