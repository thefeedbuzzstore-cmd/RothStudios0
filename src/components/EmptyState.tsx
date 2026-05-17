import { Link } from 'react-router-dom';
import { Ghost, Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'ghost' | 'search';
  actionLabel?: string;
  actionPath?: string;
}

export function EmptyState({ title, description, icon = 'ghost', actionLabel, actionPath }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-white/5">
        {icon === 'ghost' ? (
          <Ghost className="w-12 h-12 text-zinc-500" />
        ) : (
          <Search className="w-12 h-12 text-zinc-500" />
        )}
      </div>
      <h3 className="text-2xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionPath && (
        <Link to={actionPath}>
          <Button variant="primary">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
