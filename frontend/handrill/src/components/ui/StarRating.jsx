import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, interactive = false, onChange, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onChange && onChange(i + 1)}
            className={interactive ? 'cursor-pointer transition-transform active:scale-110' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              size={size}
              className={filled || half ? 'text-amber-400' : 'text-slate-200'}
              fill={filled ? '#FBBF24' : half ? 'url(#half)' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
}
