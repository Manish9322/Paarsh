'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFetchCourseVideoByIdQuery, useGetVideoProgressQuery, useUpdateVideoProgressMutation } from '@/services/api';
import { 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  ChevronRight,
  Search,
  Download,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Share2,
  FileText,
  Link2,
  Home,
  Compass,
  Bell,
  User,
  ChevronDown,
  PenLine,
  Info,
  Timer,
  GraduationCap,
  Code,
  BookOpenCheck,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Settings,
  Maximize,
  Minimize,
  Mic,
  Trophy,
  Sparkles,
  Heart
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface VideoItem {
  _id?: string;
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  completed?: boolean;
  description: string;
  resources?: Resource[];
  notes?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  learningObjectives?: string[];
  codeExamples?: string[];
  progress?: number;
  url?: string;
  transcript?: { timestamp: number; text: string }[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  wasAlreadyCompleted?: boolean;
  data?: any;
}

const initialVideos: VideoItem[] = [];

const isBase64Video = (url: string): boolean => {
  return url?.startsWith('data:video/') || url?.startsWith('data:application/octet-stream;base64,');
};

const getVideoUrl = (video: VideoItem | null): string => {
  if (!video || !video.url) return '';
  if (video.url.startsWith('http') || video.url.startsWith('https') || isBase64Video(video.url)) {
    return video.url;
  }
  return "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
};

// Mock AI-generated summary
const generateAISummary = (video: VideoItem | null): string => {
  if (!video) return 'No summary available.';
  return `This video, "${video.title}", dives into ${video.learningObjectives?.join(', ') || 'core concepts and practical examples'}. Perfect for ${video.difficulty} learners. Expected time: ${video.estimatedTime}.`;
};

// Utility to compare video arrays
const areVideosEqual = (prev: VideoItem[], next: VideoItem[]): boolean => {
  if (prev.length !== next.length) return false;
  return prev.every((video, index) => {
    const nextVideo = next[index];
    return (
      video.id === nextVideo.id &&
      video.progress === nextVideo.progress &&
      video.completed === nextVideo.completed
    );
  });
};

export default function CourseLecturePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: courseVideoData, isLoading, isError } = useFetchCourseVideoByIdQuery({ 
    courseId 
  }, {
    skip: !courseId
  });

  const { data: progressData } = useGetVideoProgressQuery(courseId, {
    skip: !courseId,
    pollingInterval: 0, // Disable polling to avoid frequent refetches
  });

  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(128);
  const [hasLiked, setHasLiked] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [lastSyncedProgress, setLastSyncedProgress] = useState<{ [key: string]: number }>({});
  const [notification, setNotification] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Sync videos with courseVideoData
  useEffect(() => {
    if (courseVideoData) {
      let videoItems: VideoItem[] = [];
      if (courseVideoData.data && Array.isArray(courseVideoData.data)) {
        videoItems = courseVideoData.data.map((video: any) => ({
          id: video._id || video.id,
          _id: video._id,
          title: video.title || video.videoName || 'Untitled Video',
          duration: video.duration || '00:00',
          thumbnail: video.thumbnail || '/video-thumb-1.jpg',
          completed: video.completed || false,
          description: video.description || 'No description available.',
          resources: video.resources || [],
          difficulty: video.difficulty || 'Beginner',
          estimatedTime: video.estimatedTime || video.duration || '15 minutes',
          learningObjectives: video.learningObjectives || ['Understand key concepts', 'Apply practical examples'],
          codeExamples: video.codeExamples || [],
          progress: video.progress || 0,
          url: video.url || video.videoId || '',
          transcript: video.transcript || [
            { timestamp: 0, text: 'Welcome to the course video.' },
            { timestamp: 10, text: 'Let’s explore the main topic.' },
            { timestamp: 20, text: 'Here’s a critical concept to grasp.' },
            { timestamp: 30, text: 'Practical example begins now.' }
          ]
        }));
      } else if (courseVideoData.data && courseVideoData.data.topics && Array.isArray(courseVideoData.data.topics)) {
        courseVideoData.data.topics.forEach((topic: any) => {
          if (topic.videos && Array.isArray(topic.videos)) {
            const topicVideos = topic.videos.map((video: any) => ({
              id: video._id || video.id,
              _id: video._id,
              title: video.videoName || video.title || `${topic.topicName} video`,
              duration: video.duration || '00:00',
              thumbnail: video.thumbnail || '/video-thumb-1.jpg',
              completed: video.completed || false,
              description: video.description || `Video from topic: ${topic.topicName}`,
              resources: video.resources || [],
              difficulty: video.difficulty || 'Beginner',
              estimatedTime: video.estimatedTime || video.duration || '15 minutes',
              learningObjectives: video.learningObjectives || ['Understand key concepts', 'Apply practical examples'],
              codeExamples: video.codeExamples || [],
              progress: video.progress || 0,
              url: video.videoId || video.url || '',
              transcript: video.transcript || [
                { timestamp: 0, text: 'Welcome to the course video.' },
                { timestamp: 10, text: 'Let’s explore the main topic.' },
                { timestamp: 20, text: 'Here’s a critical concept to grasp.' },
                { timestamp: 30, text: 'Practical example begins now.' }
              ]
            }));
            videoItems = [...videoItems, ...topicVideos];
          }
        });
      }
      if (videoItems.length > 0) {
        setVideos(prevVideos => {
          if (areVideosEqual(prevVideos, videoItems)) return prevVideos;
          return videoItems;
        });
        if (!currentVideo) {
          setCurrentVideo(videoItems[0]);
          setVideoProgress(videoItems[0].progress || 0);
        }
        const completedVideos = videoItems.filter(v => v.completed).length;
        setCourseProgress((completedVideos / videoItems.length) * 100);
      }
    }
  }, [courseVideoData, currentVideo]);

  // Sync videos and currentVideo with progressData
  useEffect(() => {
    if (progressData?.success && progressData.data && videos.length > 0) {
      const updatedVideos = videos.map(video => {
        const progressInfo = progressData.data[video.id];
        return {
          ...video,
          progress: progressInfo?.progress || 0,
          completed: progressInfo?.completed || false,
        };
      });

      // Only update videos if they have changed
      setVideos(prevVideos => {
        if (areVideosEqual(prevVideos, updatedVideos)) return prevVideos;
        return updatedVideos;
      });

      // Update currentVideo if it exists
      if (currentVideo && progressData.data[currentVideo.id]) {
        const progressInfo = progressData.data[currentVideo.id];
        setCurrentVideo(prev => {
          if (
            prev &&
            prev.progress === progressInfo?.progress &&
            prev.completed === progressInfo?.completed
          ) {
            return prev;
          }
          return {
            ...prev,
            progress: progressInfo?.progress || 0,
            completed: progressInfo?.completed || false,
          };
        });
        setVideoProgress(progressInfo?.progress || 0);
      }

      const completedVideos = updatedVideos.filter(v => v.completed).length;
      setCourseProgress((completedVideos / updatedVideos.length) * 100);
    }
  }, [progressData]);

  const currentIndex = currentVideo ? videos.findIndex(v => v.id === currentVideo.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  const filteredVideos = useMemo(() => {
    return videos.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  const filteredTranscript = useMemo(() => {
    return currentVideo?.transcript?.filter(line =>
      line.text.toLowerCase().includes(transcriptSearch.toLowerCase())
    ) || [];
  }, [currentVideo?.transcript, transcriptSearch]);

  const handlePreviousVideo = () => {
    if (hasPrevious) {
      const prevVideo = videos[currentIndex - 1];
      console.log('handlePreviousVideo:', prevVideo.id, { completed: prevVideo.completed, url: getVideoUrl(prevVideo) });
      setCurrentVideo(prevVideo);
      setVideoProgress(prevVideo.progress || 0);
      setIsPlaying(false);
      if (videoRef) {
        videoRef.src = getVideoUrl(prevVideo); // Explicitly set src
        videoRef.currentTime = 0;
        videoRef.load();
      }
    }
  };

  const handleNextVideo = () => {
    if (hasNext) {
      const nextVideo = videos[currentIndex + 1];
      console.log('handleNextVideo:', nextVideo.id, { completed: nextVideo.completed, url: getVideoUrl(nextVideo) });
      setCurrentVideo(nextVideo);
      setVideoProgress(nextVideo.progress || 0);
      setIsPlaying(false);
      if (videoRef) {
        videoRef.src = getVideoUrl(nextVideo); // Explicitly set src
        videoRef.currentTime = 0;
        videoRef.load();
      }
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setHasLiked(!hasLiked);
  };

  const handleVideoClick = (video: VideoItem) => {
    console.log('handleVideoClick:', video.id, { completed: video.completed, url: getVideoUrl(video) });
    setCurrentVideo(video);
    setExpandedVideoId(video.id === expandedVideoId ? null : video.id);
    setVideoProgress(video.progress || 0);
    setIsPlaying(false);
    if (videoRef) {
      videoRef.src = getVideoUrl(video); // Explicitly set src
      videoRef.currentTime = 0;
      videoRef.load(); // Reset video player
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef || !currentVideo) return;
  
    console.log('handlePlayPause:', currentVideo.id, {
      isPlaying,
      completed: currentVideo.completed,
      currentTime: videoRef.currentTime,
      src: videoRef.src
    });
  
    if (isPlaying) {
      videoRef.pause();
      setIsPlaying(false);
      return;
    }
  
    let attempts = 0;
    const maxAttempts = 5;
  
    const waitForLoad = (type: 'metadata' | 'data' = 'metadata'): Promise<void> => {
      const event = type === 'metadata' ? 'loadedmetadata' : 'loadeddata';
      return new Promise(resolve => {
        const onLoad = () => {
          videoRef.removeEventListener(event, onLoad);
          resolve();
        };
        videoRef.addEventListener(event, onLoad);
      });
    };
  
    const resetVideo = async () => {
      const newSrc = getVideoUrl(currentVideo) + `?t=${Date.now()}`;
      videoRef.src = newSrc;
      videoRef.load();
      await waitForLoad('metadata'); // wait until metadata is available
      videoRef.currentTime = 0;
      console.log('Video reset complete, currentTime:', videoRef.currentTime);
    };
  
    const playVideo = async (): Promise<void> => {
      try {
        await videoRef.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback error:', err);
        if (++attempts < maxAttempts) {
          console.log(`Retrying playback (attempt ${attempts + 1})`);
          await resetVideo();
          return playVideo();
        } else {
          setNotification('Failed to play video. Please try again or refresh the page.');
          setTimeout(() => setNotification(null), 5000);
        }
      }
    };
  
    if (currentVideo.completed) {
      await resetVideo();
    }
  
    await playVideo();
  };
  

  const handleTimeUpdate = () => {
    if (videoRef && currentVideo) {
      const progress = Math.min((videoRef.currentTime / videoRef.duration) * 100, 100);
      const isCompleted = progress >= 95 || (videoRef.ended && progress > 90);
  
      // Always update the progress bar
      setVideoProgress(progress);
  
      // Only sync with the server if progress has changed significantly or completion status changes
      const lastProgress = lastSyncedProgress[currentVideo.id] || 0;
      const shouldUpdate = isCompleted || Math.abs(progress - lastProgress) >= 5;
  
      if (shouldUpdate) {
        syncVideoProgress(currentVideo.id, progress, isCompleted);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = (x / width) * 100;
      videoRef.currentTime = (percentage / 100) * videoRef.duration;
      setVideoProgress(percentage);
    }
  };

  const handleTranscriptClick = (timestamp: number) => {
    if (videoRef) {
      videoRef.currentTime = timestamp;
      videoRef.play().catch(err => {
        console.error('Error playing video from transcript:', err);
        setNotification('Failed to play video. Please try again.');
        setTimeout(() => setNotification(null), 3000);
      });
      setIsPlaying(true);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef) {
      videoRef.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef) {
      videoRef.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedOptions(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleFastForward = () => {
    if (videoRef) {
      videoRef.currentTime += 10;
    }
  };

  const handleRewind = () => {
    if (videoRef) {
      videoRef.currentTime -= 10;
    }
  };

  const [updateProgress, { isLoading: isSyncingProgress }] = useUpdateVideoProgressMutation();

  const syncVideoProgress = async (videoId: string, progress: number, completed: boolean) => {
    if (currentVideo?.completed && !completed) {
      return; // Skip syncing if video is already completed and not marking as completed
    }
    try {
      setIsSaving(true);
      const result: ApiResponse = await updateProgress({
        videoId,
        courseId,
        progress,
        completed,
      }).unwrap();
      if (result.success) {
        setLastSyncedProgress(prev => ({ ...prev, [videoId]: progress }));
        let notificationMessage = completed ? 'Video marked as completed!' : 'Progress saved!';
        if (result.wasAlreadyCompleted) {
          notificationMessage = 'Video already completed.';
        }
        setNotification(notificationMessage);
        setTimeout(() => setNotification(null), 3000);
        // Update local state only after successful sync
        setVideos(prevVideos => {
          const updatedVideos = prevVideos.map(video =>
            video.id === videoId
              ? { ...video, progress, completed }
              : video
          );
          return areVideosEqual(prevVideos, updatedVideos) ? prevVideos : updatedVideos;
        });
        if (currentVideo?.id === videoId) {
          setCurrentVideo(prev => ({
            ...prev,
            progress,
            completed,
          }));
        }
        const completedVideos = videos.filter(v => v.id === videoId ? completed : v.completed).length;
        setCourseProgress((completedVideos / videos.length) * 100);
      } else {
        setNotification('Failed to save progress. Please try again.');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error syncing progress:', error);
      setNotification('Error saving progress. Please try again.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFavorite = (video: VideoItem) => {
    console.log(`Added ${video.title} to favorites`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4 sm:gap-8">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div className="text-sm font-medium text-gray-700 truncate max-w-[200px] sm:max-w-[400px]">
                Course / {currentVideo?.title || 'Loading...'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hidden sm:flex">
                <Home className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hidden sm:flex">
                <Compass className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/user-avatar.jpg" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-teal-600 text-white rounded-lg p-3 shadow-lg flex items-center gap-2 animate-slide-in" aria-live="polite">
          <Sparkles className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Progress Dashboard */}
      <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-2xl flex items-center gap-4 animate-pulse-slow">
        <Trophy className="h-6 w-6 text-yellow-300" />
        <div className="text-sm font-semibold">
          Course Progress: {Math.round(courseProgress)}%
        </div>
        <div className="w-24 h-3 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-300 transition-all duration-500"
            style={{ width: `${courseProgress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] pt-14">
        {/* Video Section */}
        <div className="w-full lg:w-[70%] h-full">
          <div className="h-full p-3 sm:p-4">
            <div className="w-full max-w-[900px] mx-auto space-y-4">
              {/* Video Player */}
              {isLoading ? (
                <div className="relative w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading video...</span>
                </div>
              ) : isError ? (
                <div className="relative w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                  <div className="text-red-500">Error loading video. Please try again.</div>
                </div>
              ) : !currentVideo ? (
                <div className="relative w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                  <div className="text-gray-500">No video selected</div>
                </div>
              ) : (
                <div 
                  className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl group"
                  onMouseMove={handleMouseMove}
                >
                  <video
                    ref={setVideoRef}
                    className="w-full h-full object-cover"
                    src={getVideoUrl(currentVideo)}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => {
                      setIsPlaying(false);
                      if (!currentVideo.completed) {
                        syncVideoProgress(currentVideo.id, 100, true);
                      }
                    }}
                    aria-label="Course video player"
                  />
                  
                  {/* Video Controls Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
                      showControls ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-4">
                      {/* Progress Bar */}
                      <div
                        className="relative h-1 bg-white/30 rounded-full cursor-pointer group-hover:h-2 transition-all"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `calc(${videoProgress}% - 6px)` }}
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handlePlayPause}
                            className="text-white hover:text-blue-300 transition-colors"
                            aria-label={isPlaying ? 'Pause video' : 'Play video'}
                          >
                            {isPlaying ? (
                              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                              </svg>
                            ) : (
                              <Play className="w-8 h-8" />
                            )}
                          </button>
                          <button
                            onClick={handleRewind}
                            className="text-white hover:text-blue-300"
                            aria-label="Rewind 10 seconds"
                          >
                            <Rewind className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleFastForward}
                            className="text-white hover:text-blue-300"
                            aria-label="Fast forward 10 seconds"
                          >
                            <FastForward className="w-6 h-6" />
                          </button>
                          <div
                            className="relative flex items-center"
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                          >
                            <button
                              onClick={toggleMute}
                              className="text-white hover:text-blue-300"
                              aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                              {isMuted || volume === 0 ? (
                                <VolumeX className="w-6 h-6" />
                              ) : (
                                <Volume2 className="w-6 h-6" />
                              )}
                            </button>
                            {showVolumeSlider && (
                              <div className="absolute bottom-full mb-2 bg-black/90 rounded-lg p-2 w-24">
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={volume}
                                  onChange={handleVolumeChange}
                                  className="w-full accent-blue-500"
                                  aria-label="Volume control"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <button
                              onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                              className="text-white hover:text-blue-300 text-sm"
                              aria-label="Change playback speed"
                            >
                              {playbackSpeed}x
                            </button>
                            {showSpeedOptions && (
                              <div className="absolute bottom-full mb-2 bg-black/90 rounded-lg p-2 w-24">
                                {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-blue-500/20 ${
                                      playbackSpeed === speed ? 'bg-blue-500/30 text-blue-300' : 'text-white'
                                    }`}
                                  >
                                    {speed}x
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-blue-300"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                          >
                            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{currentVideo?.duration}</span>
                      </div>
                      {currentVideo?.completed && (
                        <div className="flex items-center gap-1.5 text-green-400 animate-scale-in">
                          <CheckCircle2 className="h-4 w-4" aria-label="Video completed" />
                          <span>Completed</span>
                        </div>
                      )}
                      {isSaving && (
                        <div className="flex items-center gap-1.5">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Details */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-full p-1">
                    <TabsTrigger value="description" className="rounded-full">Description</TabsTrigger>
                    <TabsTrigger value="transcript" className="rounded-full">Transcript</TabsTrigger>
                    <TabsTrigger value="resources" className="rounded-full">Resources</TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-full">Notes</TabsTrigger>
                    <TabsTrigger value="qa" className="rounded-full">Q&A</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{currentVideo?.title}</h2>
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-700 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Summary
                      </h3>
                      <p className="text-sm text-gray-700">{generateAISummary(currentVideo)}</p>
                    </div>
                    <p className="text-sm text-gray-600">{currentVideo?.description}</p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="h-4 w-4" />
                        {currentVideo?.duration}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Timer className="h-4 w-4" />
                        {currentVideo?.estimatedTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            currentVideo?.difficulty === 'Beginner'
                              ? 'bg-green-100 text-green-700'
                              : currentVideo?.difficulty === 'Intermediate'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {currentVideo?.difficulty}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="transcript" className="mt-4">
                    {currentVideo?.transcript?.length ? (
                      <>
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search transcript..."
                            value={transcriptSearch}
                            onChange={(e) => setTranscriptSearch(e.target.value)}
                            className="pl-10 bg-gray-100 border-none rounded-full text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <ScrollArea className="h-64">
                          {filteredTranscript.length === 0 ? (
                            <p className="text-sm text-gray-500">No transcript lines match your search.</p>
                          ) : (
                            <div ref={transcriptRef} className="space-y-2">
                              {filteredTranscript.map((line, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleTranscriptClick(line.timestamp)}
                                  className="w-full text-left text-sm text-gray-600 hover:bg-blue-100 p-2 rounded transition-colors"
                                >
                                  <span className="text-xs text-gray-400">
                                    {new Date(line.timestamp * 1000).toISOString().substr(14, 5)}
                                  </span>
                                  <span className="ml-2">{line.text}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Transcript not available for this video.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="resources" className="mt-4">
                    {currentVideo?.resources && currentVideo.resources.length > 0 ? (
                      <div className="space-y-2">
                        {currentVideo.resources.map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.url}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No resources available.</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 flex items-center gap-2 text-xs border-gray-300 hover:bg-blue-50"
                      disabled
                    >
                      <Code className="h-3.5 w-3.5" />
                      AR Preview (Coming Soon)
                    </Button>
                  </TabsContent>
                  <TabsContent value="notes" className="mt-4">
                    <textarea
                      className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm text-gray-900"
                      placeholder="Add your notes here..."
                      defaultValue={currentVideo?.notes}
                    />
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">Save Notes</Button>
                  </TabsContent>
                  <TabsContent value="qa" className="mt-4">
                    <p className="text-sm text-gray-500">Q&A section coming soon!</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="w-full lg:w-[30%] h-[calc(100vh-20rem)] lg:h-full border-t lg:border-t-0 lg:border-l bg-gradient-to-b from-teal-50 to-indigo-100">
          <div className="sticky top-14 z-10 bg-white/95 backdrop-blur-md p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
              <span className="text-sm text-gray-500">{videos.length} lectures</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 border-none rounded-full text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-teal-500"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-teal-600"
                aria-label="Voice control (coming soon)"
                disabled
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-24rem)] lg:h-[calc(100vh-14rem)] p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-gray-600">Loading videos...</span>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-32 text-red-500">
                Error loading videos. Please try again.
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                {searchQuery ? 'No videos match your search.' : 'No videos available for this course.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`rounded-xl overflow-hidden bg-white/30 backdrop-blur-md border border-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-400 group ${
                      currentVideo?.id === video.id ? 'bg-teal-100/50 border-teal-400 shadow-lg' : ''
                    }`}
                  >
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => handleVideoClick(video)}
                    >
                      <div className="flex items-center gap-3 flex-grow min-w-0">
                        <div className="flex-shrink-0 relative w-8 h-8">
                          {video.completed ? (
                            <CheckCircle2 className="h-8 w-8 text-teal-600 animate-scale-in" aria-label="Video completed" />
                          ) : (
                            <>
                              <svg className="absolute inset-0" viewBox="0 0 36 36" aria-label={`Video progress: ${Math.round(video.progress || 0)}%`}>
                                <path
                                  className="fill-none stroke-gray-200 stroke-2"
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="fill-none stroke-teal-600 stroke-2 transition-all duration-500"
                                  strokeDasharray={`${video.progress || 0}, 100`}
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <Play className="h-4 w-4 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 truncate">{video.title}</h3>
                          <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{video.duration}</span>
                            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">
                              {video.difficulty}
                            </span>
                            {video.progress && video.progress > 0 && !video.completed && (
                              <span className="text-teal-600">{Math.round(video.progress)}% watched</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                          expandedVideoId === video.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Hover Actions */}
                    <div className="hidden group-hover:flex items-center gap-2 px-4 pb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:bg-teal-100"
                        onClick={() => handleVideoClick(video)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play Now
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:bg-teal-100"
                        onClick={() => handleFavorite(video)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Favorite
                      </Button>
                    </div>

                    {expandedVideoId === video.id && (
                      <div className="p-4 bg-white/20 backdrop-blur-sm">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-xs border-teal-300 text-teal-700 hover:bg-teal-100"
                            disabled={!video.resources || video.resources.length === 0}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Resources
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-xs border-teal-300 text-teal-700 hover:bg-teal-100"
                          >
                            <PenLine className="h-3.5 w-3.5" />
                            Notes
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                              <Timer className="h-3.5 w-3.5" />
                              Duration
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {video.estimatedTime || video.duration}
                            </div>
                          </div>
                          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              Level
                            </div>
                            <div className="text-sm font-medium text-gray-900">{video.difficulty}</div>
                          </div>
                        </div>

                        {video.learningObjectives && video.learningObjectives.length > 0 && (
                          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpenCheck className="h-4 w-4 text-teal-600" />
                              <h4 className="text-sm font-medium text-gray-900">Learning Objectives</h4>
                            </div>
                            <ul className="space-y-2">
                              {video.learningObjectives.map((objective, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2"></div>
                                  <span>{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {video.codeExamples && video.codeExamples.length > 0 && (
                          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Code className="h-4 w-4 text-teal-600" />
                              <h4 className="text-sm font-medium text-gray-900">Code Examples</h4>
                            </div>
                            <div className="bg-gray-100/50 rounded p-2.5 space-y-1.5">
                              {video.codeExamples.map((example, index) => (
                                <div key={index} className="text-sm font-mono text-gray-700">
                                  {example}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {video.resources && video.resources.length > 0 && (
                          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-teal-600" />
                              <h4 className="text-sm font-medium text-gray-900">Resources</h4>
                            </div>
                            <div className="space-y-1.5">
                              {video.resources.map(resource => (
                                <Button
                                  key={resource.id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm text-teal-700 hover:text-teal-900 hover:bg-teal-100"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {resource.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Recommended Next Video */}
                <div className="mt-4 p-4 bg-purple-100 rounded-xl">
                  <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Recommended Next
                  </h3>
                  <p className="text-sm text-gray-700">Explore the next video in your learning path (personalized suggestions coming soon).</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Inline CSS for Animations */}
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes slide-in {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .group:hover .group-hover\\:flex {
          display: flex;
        }
      `}</style>
    </div>
  );
}