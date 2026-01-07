import { cn } from '@/lib/utils';

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const GlitchText = ({ 
  children, 
  className,
  as: Component = 'span' 
}: GlitchTextProps) => {
  return (
    <Component 
      className={cn(
        'relative inline-block animate-glitch font-display',
        className
      )}
    >
      {children}
    </Component>
  );
};
