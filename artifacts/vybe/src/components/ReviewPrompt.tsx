import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewPromptProps {
  bookingId: string;
  providerName: string;
  onDone: () => void;
}

export function ReviewPrompt({ bookingId, providerName, onDone }: ReviewPromptProps) {
  const { apiFetch } = useApiClient();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const submitMutation = useMutation({
    mutationFn: () => apiFetch("POST", "/api/reviews", { bookingId, rating, comment: comment || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings", "client"] });
      toast.success("Review submitted. Thanks!");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to submit review"),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <p className="font-semibold mb-1">How was your visit?</p>
      <p className="text-sm text-muted-foreground mb-5">Rate your experience with {providerName}</p>

      <div className="flex justify-center gap-2 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110">
            <Star className={cn(
              "w-8 h-8 transition-colors",
              (hovered || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            )} />
          </button>
        ))}
      </div>

      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Share details about your experience (optional)"
        rows={3}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground mb-4" />

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onDone}>Skip</Button>
        <Button className="flex-1" disabled={rating === 0 || submitMutation.isPending}
          onClick={() => submitMutation.mutate()}>
          {submitMutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
