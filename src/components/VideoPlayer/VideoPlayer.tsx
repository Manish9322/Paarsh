import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
}

const VideoPlayer = ({ 
  thumbnailUrl, 
  videoUrl, 
  title, 
  onProgress, 
  onComplete,
  initialProgress = 0 
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      onProgress?.(currentProgress);

      if (currentProgress >= 95 || (videoRef.current.ended && currentProgress > 90)) {
        onComplete?.();
      }
    }
  };

  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  useEffect(() => {
    if (videoRef.current && initialProgress > 0) {
      videoRef.current.currentTime = (initialProgress / 100) * videoRef.current.duration;
    }
  }, [initialProgress]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      {!isPlaying ? (
        <div 
          className="relative cursor-pointer group"
          onClick={handleThumbnailClick}
        >
          <Image
            src={thumbnailUrl || "/images/blog/blog-details-01.jpg"}
            alt={title}
            width={800}
            height={500}
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110">
              <svg 
                className="w-8 h-8 text-white ml-1" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-30 transition-opacity"></div>
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            controls
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => onComplete?.()}
          />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;