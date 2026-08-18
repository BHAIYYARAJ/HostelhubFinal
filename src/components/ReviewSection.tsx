import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Flag, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useReviews, useReviewEligibility, useReviewMutations, DbReview } from "@/hooks/useReviews";

interface Props {
  hostelId: string;
  hostelName: string;
  ownerId?: string | null;
}

const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) => {
  const [hover, setHover] = useState(0);
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={`${star} star`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"}`}
        >
          <Star
            className={`${px} ${
              star <= (hover || value) ? "fill-amber-400 text-amber-400" : "fill-none text-border"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingBreakdown = ({ reviews }: { reviews: DbReview[] }) => {
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    stars: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <div className="text-center">
        <p className="text-4xl font-bold tabular-nums text-foreground">{total ? avg.toFixed(1) : "—"}</p>
        <StarRating value={Math.round(avg)} readonly size="md" />
        <p className="mt-1 text-sm text-muted-foreground">
          {total} verified review{total !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="w-full max-w-xs flex-1 space-y-1.5">
        {counts.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-3 text-right tabular-nums text-muted-foreground">{stars}</span>
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({
  review,
  isOwner,
  onReply,
  onReport,
  busy,
}: {
  review: DbReview;
  isOwner: boolean;
  onReply: (reply: string) => void;
  onReport: () => void;
  busy: boolean;
}) => {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const name = review.is_anonymous ? "Anonymous student" : review.student_name || "Student";
  const initials = review.is_anonymous
    ? "A"
    : name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="border-b border-border py-5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              {name}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                <ShieldCheck className="h-3 w-3" /> Verified stay
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
      )}

      {review.owner_reply && (
        <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3">
          <p className="text-xs font-semibold text-foreground">Owner response</p>
          <p className="mt-1 text-sm text-muted-foreground">{review.owner_reply}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isOwner && !review.owner_reply && (
          <button
            onClick={() => setReplying((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <MessageSquare className="h-3 w-3" /> Reply
          </button>
        )}
        {!review.is_reported ? (
          <button
            onClick={onReport}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Flag className="h-3 w-3" /> Report
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Reported — under review</span>
        )}
      </div>

      {replying && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Respond to this review…"
            maxLength={1000}
            rows={3}
          />
          <Button
            size="sm"
            disabled={busy || !reply.trim()}
            onClick={() => {
              onReply(reply.trim());
              setReply("");
              setReplying(false);
            }}
          >
            Post response
          </Button>
        </div>
      )}
    </div>
  );
};

const ReviewSection = ({ hostelId, hostelName, ownerId }: Props) => {
  const user = useAuthStore((s) => s.user);
  const { data: reviews = [], isLoading } = useReviews(hostelId);
  const { data: eligibility } = useReviewEligibility(hostelId);
  const { create, reply, report } = useReviewMutations(hostelId);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const isOwner = !!user && !!ownerId && user.id === ownerId;
  const canReview = !!eligibility?.eligible;
  const sorted = useMemo(() => reviews, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (comment.trim().length > 1000) {
      toast.error("Review is too long");
      return;
    }
    try {
      await create.mutateAsync({
        bookingId: eligibility!.bookingId!,
        ownerId: eligibility!.ownerId!,
        rating,
        comment: comment.trim(),
        isAnonymous: anonymous,
      });
      setRating(0);
      setComment("");
      setAnonymous(false);
      setShowForm(false);
      toast.success("Review published — thanks for your feedback!");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit your review");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ratings & Reviews</h2>
        {canReview && (
          <Button
            variant={showForm ? "outline" : "default"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <RatingBreakdown reviews={sorted} />
      </div>

      {!canReview && !isOwner && (
        <p className="mb-6 rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
          Only students with a confirmed booking at {hostelName} can post a review, and only after their
          move-in date. This keeps every rating genuine.
        </p>
      )}

      {showForm && canReview && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Share your experience at {hostelName}
          </h3>

          <div className="space-y-1.5">
            <Label>Your rating</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rev-comment">Your review</Label>
            <Textarea
              id="rev-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was your stay like?"
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2">
            <Label className="text-sm">Post anonymously</Label>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} />
          </div>

          <Button type="submit" disabled={create.isPending} className="w-full">
            {create.isPending ? "Publishing…" : "Publish review"}
          </Button>
        </motion.form>
      )}

      <div className="rounded-xl border border-border bg-card px-5 shadow-card">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No reviews yet — be the first verified guest to review this hostel.
          </p>
        ) : (
          sorted.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              isOwner={isOwner}
              busy={reply.isPending || report.isPending}
              onReply={async (text) => {
                try {
                  await reply.mutateAsync({ reviewId: r.id, reply: text });
                  toast.success("Response posted");
                } catch (err: any) {
                  toast.error(err?.message ?? "Could not post response");
                }
              }}
              onReport={async () => {
                if (!user) {
                  toast.error("Please sign in to report a review");
                  return;
                }
                try {
                  await report.mutateAsync({ reviewId: r.id, reason: "Reported by user" });
                  toast.success("Review reported for moderation");
                } catch {
                  toast.error("Only the hostel owner or an admin can report this review");
                }
              }}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ReviewSection;
