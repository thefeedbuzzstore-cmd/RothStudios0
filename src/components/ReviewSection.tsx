import React, { useState, useEffect } from 'react';
import { Star, Send, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';

interface Review {
  id: string;
  movie_id: number;
  user_id: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewSectionProps {
  movieId: number;
}

export function ReviewSection({ movieId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('movie_reviews')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('movie_reviews').insert({
        movie_id: movieId,
        user_id: user.id,
        user_email: user.email,
        rating,
        comment
      });

      if (error) throw error;

      setComment('');
      setRating(0);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Make sure the "movie_reviews" table exists in your Supabase database.');
    } finally {
      setIsSubmitting(true);
      // Small delay for UI feel
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('movie_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-12" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">User Reviews</h2>
          <p className="text-zinc-500 text-sm mt-1">Share your thoughts with the community</p>
        </div>
        
        {averageRating && (
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-xl font-bold">{averageRating}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-zinc-400 text-sm font-medium">{reviews.length} total reviews</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Submit Review */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 glass p-6 rounded-2xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white">Write a Review</h3>
            
            {!user ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
                  <UserIcon className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-sm">Please sign in to leave a review</p>
                <Button variant="brand" className="w-full" asChild>
                  <a href="/login">Sign In</a>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-400">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="transition-transform active:scale-95"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star 
                          className={cn(
                            "w-8 h-8 transition-colors",
                            (hoveredRating || rating) >= star 
                              ? "text-yellow-500 fill-current" 
                              : "text-zinc-700"
                          )} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-zinc-100">
                      {hoveredRating || rating || 0}/5
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-400">Your Review</label>
                  <textarea
                    placeholder="What did you think of the movie?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-32 bg-zinc-900 border border-white/5 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2 items-center justify-center" 
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl border border-white/5">
              <p className="text-zinc-500">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass p-6 rounded-2xl border border-white/5 space-y-4 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">
                            {review.user_email?.split('@')[0]}
                          </div>
                          <div className="text-zinc-500 text-xs">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-white">{review.rating}</span>
                      </div>
                    </div>

                    <p className="text-zinc-300 leading-relaxed italic">
                      "{review.comment}"
                    </p>

                    {user?.id === review.user_id && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="absolute bottom-6 right-6 p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
