import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type WheelEvent } from "react";

import { cn } from "@/lib/utils";

const FALLBACK = "/placeholder.svg";

interface HostelImageCarouselProps {
  images?: string[] | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  imageHeightClassName?: string;
  showControls?: boolean;
}

export function HostelImageCarousel({
  images,
  alt,
  className,
  imageClassName,
  imageHeightClassName = "h-full",
  showControls = true,
}: HostelImageCarouselProps) {
  const validImages = (Array.isArray(images) ? images : []).filter(Boolean);
  const slides = validImages.length ? validImages : [FALLBACK];
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.children[nextIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    setActiveIndex(nextIndex);
  };

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || !viewport.children.length) return;

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    Array.from(viewport.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const center = element.offsetLeft + element.offsetWidth / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    viewport.scrollLeft += event.deltaX;
  };

  const multiple = slides.length > 1;

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x pan-y" }}
        aria-label={`${alt} photos`}
      >
        {slides.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative h-full w-full shrink-0 snap-center snap-always"
          >
            <img
              src={src}
              alt={`${alt} photo ${index + 1} of ${slides.length}`}
              loading={index === 0 ? "eager" : "lazy"}
              className={cn("w-full object-cover", imageHeightClassName, imageClassName)}
            />
          </div>
        ))}
      </div>

      {multiple && showControls && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={activeIndex === 0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goTo(activeIndex - 1);
            }}
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            disabled={activeIndex === slides.length - 1}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goTo(activeIndex + 1);
            }}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {multiple && (
        <div
          className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm"
          aria-hidden="true"
        >
          {slides.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
