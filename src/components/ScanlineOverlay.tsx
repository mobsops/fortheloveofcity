export const ScanlineOverlay = () => {
  return (
    <>
      {/* Scanlines */}
      <div 
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            hsl(180 100% 50% / 0.02) 2px,
            hsl(180 100% 50% / 0.02) 4px
          )`
        }}
      />
      
      {/* Scan beam */}
      <div 
        className="pointer-events-none fixed inset-x-0 h-20 z-40 animate-scan opacity-30"
        style={{
          background: 'linear-gradient(180deg, transparent, hsl(180 100% 50% / 0.1), transparent)'
        }}
      />
      
      {/* Corner brackets */}
      <div className="pointer-events-none fixed inset-4 z-40">
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/30" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/30" />
      </div>
    </>
  );
};
