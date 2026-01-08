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
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...photos, ...files].slice(0, 2); // Limit to 2 photos
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
    if (photos.length === 2) {
      onSubmit(photos);
    }
  };

  const canSubmit = photos.length === 2;

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
            Upload <span className="text-primary font-semibold">exactly 2 photos</span> of your surroundings—buildings, streets, landmarks. 
            Both will be transformed into the apocalyptic future.
          </p>
        </div>

        {/* Upload Area */}
        <div className="terminal-box p-6 mb-6">
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Photo Grid - Responsive: stack on mobile, side-by-side on tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[0, 1].map((index) => (
              <div 
                key={index}
                className={cn(
                  "aspect-[4/3] sm:aspect-video rounded border-2 border-dashed relative overflow-hidden transition-all duration-300",
                  previews[index] 
                    ? "border-primary/50 glow-border-cyan" 
                    : "border-warning/50 hover:border-warning/70"
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
                      className="absolute top-2 right-2 w-8 h-8 sm:w-6 sm:h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    >
                      <X className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-1 rounded">
                      SCAN_{index + 1}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Camera className="w-10 h-10 sm:w-8 sm:h-8 mb-2 opacity-50" />
                    <span className="text-sm sm:text-xs tracking-wider">REQUIRED</span>
                    <span className="text-xs sm:text-[10px] opacity-60">SLOT_{index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="terminal"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1"
              disabled={photos.length >= 2}
            >
              <Camera className="w-4 h-4 mr-2" />
              TAKE PHOTO
            </Button>
            <Button
              variant="terminal"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              disabled={photos.length >= 2}
            >
              <Upload className="w-4 h-4 mr-2" />
              UPLOAD
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            variant={canSubmit ? "success" : "terminal"}
            onClick={handleSubmit}
            className="w-full mt-4"
            disabled={!canSubmit}
          >
            <Check className="w-4 h-4 mr-2" />
            {canSubmit 
              ? 'ANALYZE 2 PHOTOS' 
              : `NEED ${2 - photos.length} MORE PHOTO${2 - photos.length > 1 ? 'S' : ''}`
            }
          </Button>
        </div>

        {/* Status */}
        <div className="text-center text-xs text-muted-foreground/60 font-mono">
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              canSubmit ? "bg-success" : "bg-warning animate-pulse"
            )} />
            <span>
              {canSubmit 
                ? "ENVIRONMENTAL DATA READY" 
                : "AWAITING 2 SCANS"
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};