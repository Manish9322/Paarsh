'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFetchCourseVideoByIdQuery } from '@/services/api';
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
  Minimize
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
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Initialize with empty array, will be replaced with API data
const initialVideos: VideoItem[] = [];

// Helper function to determine if the URL is base64 data
const isBase64Video = (url: string): boolean => {
  return url?.startsWith('data:video/') || url?.startsWith('data:application/octet-stream;base64,');
};

// Helper function to get a proper video URL
const getVideoUrl = (video: VideoItem | null): string => {
  if (!video || !video.url) return '';
  
  // Check if it's already a valid URL or base64 data
  if (video.url.startsWith('http') || video.url.startsWith('https') || isBase64Video(video.url)) {
    return video.url;
  }
  
  // Default fallback video
  return "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
};

export default function CourseLecturePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  console.log("Course ID from params:", courseId);
  
  // Fetch course videos data from the API with skip option to avoid undefined courseId
  const { data: courseVideoData, isLoading, isError } = useFetchCourseVideoByIdQuery({ 
    courseId 
  }, {
    // Only run the query if courseId exists
    skip: !courseId
  });
  
  console.log("API Response:", courseVideoData);
  
  // State management for videos and current video
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Effect to handle course video data when it's loaded
  useEffect(() => {
    console.log("Processing API data:", courseVideoData);
    
    // Handle different possible API response structures
    if (courseVideoData) {
      let videoItems: VideoItem[] = [];
      
      // Case 1: Direct array in data
      if (courseVideoData.data && Array.isArray(courseVideoData.data)) {
        console.log("Found direct array in data");
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
          learningObjectives: video.learningObjectives || [],
          codeExamples: video.codeExamples || [],
          progress: video.progress || 0,
          url: video.url || video.videoId || ''
        }));
      } 
      // Case 2: Nested structure with topics and videos
      else if (courseVideoData.data && courseVideoData.data.topics && Array.isArray(courseVideoData.data.topics)) {
        console.log("Found topics structure");
        // Flatten all videos from all topics
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
              learningObjectives: video.learningObjectives || [],
              codeExamples: video.codeExamples || [],
              progress: video.progress || 0,
              url: video.videoId || video.url || ''
            }));
            videoItems = [...videoItems, ...topicVideos];
          }
        });
      }
      
      console.log("Processed videos:", videoItems);
      
      if (videoItems.length > 0) {
        setVideos(videoItems);
        
        // Set the first video as current if none is selected
        if (!currentVideo) {
          console.log("Setting current video to first item");
          setCurrentVideo(videoItems[0]);
        }
      } else {
        console.log("No videos found in the API response");
      }
    }
  }, [courseVideoData, currentVideo]);

  // Effect to load user progress data
  useEffect(() => {
    loadVideoProgress();
  }, []);

  const currentIndex = currentVideo ? videos.findIndex(v => v.id === currentVideo.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreviousVideo = () => {
    if (hasPrevious) {
      setCurrentVideo(videos[currentIndex - 1]);
    }
  };

  const handleNextVideo = () => {
    if (hasNext) {
      setCurrentVideo(videos[currentIndex + 1]);
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
    setCurrentVideo(video);
    setExpandedVideoId(video.id === expandedVideoId ? null : video.id);
    setVideoProgress(video.progress || 0);
  };

  const handlePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef) {
      const progress = (videoRef.currentTime / videoRef.duration) * 100;
      setVideoProgress(progress);
      
      const isCompleted = progress >= 80;
      
      // Update videos array
      const updatedVideos = videos.map(video => {
        if (video.id === currentVideo?.id) {
          return { 
            ...video, 
            progress,
            completed: isCompleted || video.completed
          };
        }
        return video;
      });
      
      // Update current video state
      setCurrentVideo(prev => ({
        ...prev,
        progress,
        completed: isCompleted || prev.completed
      }));
      
      // Update videos state
      setVideos(updatedVideos);
      
      // Sync with backend
      syncVideoProgress(currentVideo.id, progress, isCompleted);
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

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
    setShowQualityOptions(false);
    // In a real app, you would implement quality switching logic here
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

  const syncVideoProgress = async (videoId: string, progress: number, completed: boolean) => {
    try {
      setIsSaving(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/video-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          courseId,
          progress,
          completed,
        }),
      });

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        console.error('Failed to sync progress:', data.message);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error syncing progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadVideoProgress = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/video-progress');
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        // Update videos with progress from backend
        const updatedVideos = videos.map(video => ({
          ...video,
          progress: data.data[video.id]?.progress || 0,
          completed: data.data[video.id]?.completed || false,
        }));
        
        // Update current video if it exists in the data
        if (data.data[currentVideo?.id]) {
          setCurrentVideo(prev => ({
            ...prev,
            progress: data.data[currentVideo.id].progress,
            completed: data.data[currentVideo.id].completed,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4 sm:gap-8">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-black/70" />
              </button>
              <div className="text-sm font-medium text-black/70 truncate">
                Course / {currentVideo?.title || 'Loading...'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-black/70 hover:text-black hidden sm:flex">
                <Home className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-black/70 hover:text-black hidden sm:flex">
                <Compass className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-black/70 hover:text-black">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="w-px h-6 bg-black/10 mx-2 hidden sm:block"></div>
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

      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] pt-14">
        {/* Video Section */}
        <div className="w-full lg:w-[70%] h-full">
          {/* Fixed Video Player and Title Section */}
          <div className="h-full p-3 sm:p-4">
            <div className="w-full max-w-[900px] mx-auto space-y-3">
              {/* Video Player */}
              {isLoading ? (
                <div className="relative w-full aspect-video bg-black/10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                  <span className="ml-3 text-black/70">Loading video...</span>
                </div>
              ) : isError ? (
                <div className="relative w-full aspect-video bg-black/5 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <div className="text-red-500">Error loading video. Please try again.</div>
                </div>
              ) : !currentVideo ? (
                <div className="relative w-full aspect-video bg-black/5 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <div className="text-black/50">No video selected</div>
                </div>
              ) : (
                <div 
                  className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg"
                  onMouseMove={handleMouseMove}
                >
                  <video
                    ref={setVideoRef}
                    className="w-full h-full object-cover"
                    src={getVideoUrl(currentVideo)}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300
                    ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* Progress Bar */}
                      <div className="relative h-1 bg-black/30 mb-4 cursor-pointer" onClick={handleProgressClick}>
                        <div 
                          className="absolute h-full bg-white transition-all duration-100"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>

                      {/* Controls Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={handlePlayPause} className="text-white hover:text-white/80">
                            {isPlaying ? (
                              <div className="w-8 h-8 flex items-center justify-center">
                                <div className="w-1 h-6 bg-white mx-1"></div>
                                <div className="w-1 h-6 bg-white mx-1"></div>
                              </div>
                            ) : (
                              <Play className="w-8 h-8" />
                            )}
                          </button>
                          <button onClick={handleRewind} className="text-white hover:text-white/80">
                            <Rewind className="w-6 h-6" />
                          </button>
                          <button onClick={handleFastForward} className="text-white hover:text-white/80">
                            <FastForward className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Volume Control */}
                          <div className="relative">
                            <button 
                              onClick={toggleMute}
                              onMouseEnter={() => setShowVolumeSlider(true)}
                              onMouseLeave={() => setShowVolumeSlider(false)}
                              className="text-white hover:text-white/80"
                            >
                              {isMuted || volume === 0 ? (
                                <VolumeX className="w-6 h-6" />
                              ) : (
                                <Volume2 className="w-6 h-6" />
                              )}
                            </button>
                            {showVolumeSlider && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black/80 rounded">
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={volume}
                                  onChange={handleVolumeChange}
                                  className="w-24 accent-white"
                                />
                              </div>
                            )}
                          </div>

                          {/* Playback Speed */}
                          <div className="relative">
                            <button 
                              onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                              className="text-white hover:text-white/80"
                            >
                              <span className="text-sm">{playbackSpeed}x</span>
                            </button>
                            {showSpeedOptions && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black/80 rounded space-y-1">
                                {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/10
                                      ${playbackSpeed === speed ? 'bg-white/20' : 'text-white'}`}
                                  >
                                    {speed}x
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quality Selection */}
                          <div className="relative">
                            <button 
                              onClick={() => setShowQualityOptions(!showQualityOptions)}
                              className="text-white hover:text-white/80"
                            >
                              <Settings className="w-6 h-6" />
                            </button>
                            {showQualityOptions && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black/80 rounded space-y-1">
                                {['1080p', '720p', '480p', '360p'].map((quality) => (
                                  <button
                                    key={quality}
                                    onClick={() => handleQualityChange(quality)}
                                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/10
                                      ${currentQuality === quality ? 'bg-white/20' : 'text-white'}`}
                                  >
                                    {quality}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Fullscreen Toggle */}
                          <button onClick={toggleFullscreen} className="text-white hover:text-white/80">
                            {isFullscreen ? (
                              <Minimize className="w-6 h-6" />
                            ) : (
                              <Maximize className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs">
                      <div className="flex items-center gap-1.5 text-white">
                        <Clock className="h-3 w-3" />
                        <span>{currentVideo?.duration}</span>
                      </div>
                      {currentVideo?.completed && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed</span>
                        </div>
                      )}
                      {isSaving && (
                        <div className="flex items-center gap-1.5 text-white/60">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Title and Actions */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-black/5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="px-2 py-1 bg-black/5 rounded-md text-xs font-medium text-black/70">
                        Chapter 1
                      </div>
                      <div className="h-1 w-1 bg-black/30 rounded-full"></div>
                      <div className="text-xs text-black/50">
                        Last updated: 2 weeks ago
                      </div>
                    </div>
                    <h1 className="text-lg sm:text-xl font-semibold text-black mb-2 line-clamp-2">
                      {currentVideo?.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-black/60">
                        <Clock className="h-4 w-4" />
                        <span>{currentVideo?.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-black/60">
                        <Timer className="h-4 w-4" />
                        <span className="hidden sm:inline">Est. </span>
                        <span>{currentVideo?.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${currentVideo?.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                            currentVideo?.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-600' :
                            'bg-purple-50 text-purple-600'}`}>
                          {currentVideo?.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="w-full lg:w-[30%] h-[calc(100vh-20rem)] lg:h-full border-t lg:border-t-0 lg:border-l">
          <div className="h-full bg-black/5 p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm sm:text-base text-black">Course Content</h2>
                <span className="text-xs text-black/50">{videos.length} lectures</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40" />
                <Input
                  type="text"
                  placeholder="Search lectures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-9 bg-white border-black/10 text-black placeholder-black/30 text-sm"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-24rem)] lg:h-[calc(100vh-14rem)] pb-3 sm:pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <span className="ml-3 text-black/70">Loading videos...</span>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                  Error loading videos. Please try again.
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-black/50">
                  {searchQuery ? 'No videos match your search.' : 'No videos available for this course.'}
                </div>
              ) : (
                <div className="space-y-1.5 sm:space-y-2 pr-2 sm:pr-4">
                  {filteredVideos.map((video) => (
                    <div key={video.id} className="rounded-lg overflow-hidden border border-black/10">
                      <button
                        className={`w-full flex items-center justify-between p-3 sm:p-4 text-left
                          transition-all duration-200 bg-white
                          ${currentVideo && currentVideo.id === video.id ? 'bg-black/5' : 'hover:bg-black/5'}`}
                        onClick={() => handleVideoClick(video)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
                          <div className="flex-shrink-0">
                            {video.progress && video.progress >= 80 ? (
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                            ) : (
                              <div className="relative">
                                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-black/40" />
                                {video.progress && video.progress > 0 && video.progress < 80 && (
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                                    style={{ width: `${video.progress}%` }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-xs sm:text-sm truncate text-black">
                              {video.title}
                            </h3>
                            <div className="flex items-center gap-2 text-black/40 text-xs">
                              <Clock className="h-3 w-3" />
                              <span>{video.duration}</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/5 text-black/60">
                                {video.difficulty}
                              </span>
                              {video.progress && video.progress > 0 && video.progress < 80 && (
                                <span className="text-emerald-500">
                                  {Math.round(video.progress)}% watched
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 sm:h-5 sm:w-5 text-black/40 transition-transform duration-200
                            ${expandedVideoId === video.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {expandedVideoId === video.id && (
                        <div className="p-3 sm:p-4 bg-black/5">
                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-xs bg-white hover:bg-black/5"
                              disabled={!video.resources || video.resources.length === 0}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Resources</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-xs bg-white hover:bg-black/5"
                            >
                              <PenLine className="h-3.5 w-3.5" />
                              <span>Notes</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-xs bg-white hover:bg-black/5"
                            >
                              <Info className="h-3.5 w-3.5" />
                              <span>Info</span>
                            </Button>
                          </div>

                          {/* Video Info Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white rounded-lg p-2.5">
                              <div className="flex items-center gap-2 text-black/60 mb-1">
                                <Timer className="h-3.5 w-3.5" />
                                <span className="text-xs">Duration</span>
                              </div>
                              <div className="text-sm font-medium text-black">
                                {video.estimatedTime || video.duration}
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2.5">
                              <div className="flex items-center gap-2 text-black/60 mb-1">
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span className="text-xs">Level</span>
                              </div>
                              <div className="text-sm font-medium text-black">
                                {video.difficulty}
                              </div>
                            </div>
                          </div>

                          {/* Learning Objectives */}
                          {video.learningObjectives && video.learningObjectives.length > 0 && (
                            <div className="bg-white rounded-lg p-3 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpenCheck className="h-4 w-4 text-black/70" />
                                <h4 className="text-sm font-medium text-black">Learning Objectives</h4>
                              </div>
                              <ul className="space-y-2">
                                {video.learningObjectives.map((objective, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-black/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-black/20 mt-2"></div>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Code Examples */}
                          {video.codeExamples && video.codeExamples.length > 0 && (
                            <div className="bg-white rounded-lg p-3 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-black/70" />
                                <h4 className="text-sm font-medium text-black">Code Examples</h4>
                              </div>
                              <div className="bg-black/5 rounded p-2.5 space-y-1.5">
                                {video.codeExamples.map((example, index) => (
                                  <div key={index} className="text-sm font-mono text-black/70">
                                    {example}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Resources */}
                          {video.resources && video.resources.length > 0 && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-black/70" />
                                <h4 className="text-sm font-medium text-black">Resources</h4>
                              </div>
                              <div className="space-y-1.5">
                                {video.resources.map(resource => (
                                  <Button
                                    key={resource.id}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-sm text-black/70 hover:text-black hover:bg-black/5"
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
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

