import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadScreenProps {
  username: string;
  onSubmit: (photos: File[]) => void;
}

export const PhotoUploadScreen = ({ username, onSubmit }: PhotoUploadScreenProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...photos, ...files].slice(0, 4);
    setPhotos(newPhotos);
    
    // Generate previews
    const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    if (photos.length > 0) {
      onSubmit(photos);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-xs text-muted-foreground tracking-widest mb-2">
            TRAVELER: {username.toUpperCase()}
          </div>
          <h2 className="font-display text-2xl md:text-3xl glow-text-cyan mb-4">
            CAPTURE YOUR REALITY
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Upload photos of your surroundings—buildings, streets, landmarks. 
            These will be analyzed to reconstruct the temporal origin point.
          </p>
        </div>

        {/* Upload Area */}
        <div className="terminal-box p-6 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index}
                className={cn(
                  "aspect-video rounded border-2 border-dashed relative overflow-hidden transition-all duration-300",
                  previews[index] 
                    ? "border-primary/50 glow-border-cyan" 
                    : "border-muted-foreground/30 hover:border-primary/30"
                )}
              >
                {previews[index] ? (
                  <>
                    <img 
                      src={previews[index]} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-1 rounded">
                      SCAN_{index + 1}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs tracking-wider">SLOT_{index + 1}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="terminal"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              disabled={photos.length >= 4}
            >
              <Upload className="w-4 h-4 mr-2" />
              ADD PHOTOS
            </Button>
            <Button
              variant="terminal"
              onClick={handleSubmit}
              className="flex-1"
              disabled={photos.length === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              ANALYZE ({photos.length}/4)
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="text-center text-xs text-muted-foreground/60 font-mono">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>AWAITING ENVIRONMENTAL DATA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
