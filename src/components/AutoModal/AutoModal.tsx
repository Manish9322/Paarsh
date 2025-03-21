'use client';
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent as DialogContentPrimitive, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

// Custom DialogContent without close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[9999] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[10000] grid w-[90%] max-w-[90vw] max-h-[90vh] max-h-[calc(var(--app-height,100vh)*0.9)] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* Removed the close button that was here */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;


export default function AutoModal() {
  const [open, setOpen] = useState(false);
  const [forcedModal, setForcedModal] = useState(false);

  // Component-specific WebView detection flag
  const [isWebViewApp, setIsWebViewApp] = useState(false);

  useEffect(() => {
    // More aggressive WebView detection
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Use the global flag if available
    const isWebView = 
      // @ts-ignore - Global flag from layout.tsx
      window.isWebViewApp ||
      // @ts-ignore - Global flag from layout.tsx
      window.forceOpenModals ||
      userAgent.includes('wv') || 
      userAgent.includes('android') || 
      (userAgent.includes('mobile') && !userAgent.includes('safari')) ||
      // @ts-ignore - This property exists in some WebViews
      window.navigator.standalone === true ||
      // @ts-ignore - This property exists in WebViews
      typeof window.AndroidInterface !== 'undefined' ||
      // @ts-ignore - This property exists in WebViews
      typeof window?.webkit?.messageHandlers !== 'undefined';
    
    setIsWebViewApp(isWebView);
    
    // For WebView, always show modal
    if (isWebView) {
      // First immediate attempt
      setOpen(true);
      
      // More attempts with graduated delays
      const timers = [
        setTimeout(() => { setOpen(true); setForcedModal(true); }, 500),
        setTimeout(() => { setOpen(true); setForcedModal(true); }, 1500),
        setTimeout(() => { setOpen(true); setForcedModal(true); }, 3000)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
    
    // Normal browser behavior
    const sessionVisit = sessionStorage.getItem('hasVisited');
    if (!sessionVisit) {
      const timer = setTimeout(() => setOpen(true), 1500);
      sessionStorage.setItem('hasVisited', 'true');
      return () => clearTimeout(timer);
    }
  }, []);

  // Force re-render on WebView to ensure modal appears
  useEffect(() => {
    if (isWebViewApp && !open) {
      const forceTimer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(forceTimer);
    }
  }, [isWebViewApp, open]);

  return (
    <>
      {/* Extra element to force rendering in WebView */}
      {isWebViewApp && <div id="webview-modal-anchor" style={{position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, zIndex: 9000}} />}
      
      <Dialog 
        open={open || forcedModal} 
        onOpenChange={(isOpen) => {
          // Only allow explicit close actions to change the state
          if (!isOpen) setOpen(false);
        }}
      >
        <DialogContent className={`w-[95%] sm:w-full max-w-4xl p-0 overflow-hidden rounded-xl shadow-xl bg-white border-0 max-h-[90vh] md:max-h-[85vh] ${isWebViewApp ? 'webview-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-full h-full"
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Left column - smaller */}
              <div className="md:w-1/3 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-white">Paarsh Edu</DialogTitle>
                  <button 
                    onClick={() => setOpen(false)}
                    className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 text-white transition-colors md:hidden"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <p className="text-blue-100 text-sm mb-4 sm:mb-6">Excellence in Tech Education</p>
                
                <div className="space-y-4 sm:space-y-5 mt-6 sm:mt-8">
                  <div className="bg-blue-500/20 rounded-lg p-3 sm:p-4">
                    <p className="font-semibold text-base sm:text-lg">Limited Time Offer</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1">₹2,499 only</p>
                    <p className="text-blue-100 text-xs mt-1">for complete course access</p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Contact Us</p>
                    <p className="text-blue-100 text-sm sm:text-base">9860988343</p>
                    <p className="text-blue-100 text-sm sm:text-base">9075201035</p>
                    <p className="text-blue-100 text-xs mt-1">info@paarshedu.com</p>
                  </div>
                  
                  <div className="pt-3 sm:pt-4 hidden md:block">
                    <Button 
                      className="w-full bg-white text-blue-700 hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-sm transition-colors text-sm sm:text-base font-medium" 
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Right column - larger */}
              <div className="md:w-2/3 p-4 sm:p-6 pb-6 sm:pb-8 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[85vh] relative">
                <button 
                  onClick={() => setOpen(false)}
                  className="absolute right-3 sm:right-4 top-3 sm:top-4 bg-blue-100/50 hover:bg-blue-100 rounded-full p-1.5 text-blue-700 transition-colors hidden md:flex"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
                
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-3 sm:mb-4">Welcome to Paarsh Edu!</h2>
                
                <div className="space-y-4 sm:space-y-5">
                  <p className="text-sm sm:text-base text-gray-700">Your gateway to comprehensive tech education and professional development.</p>
                  
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <p className="text-blue-800 font-semibold text-sm sm:text-base">Our Flagship Programs</p>
                    <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                      <div>
                        <p className="font-medium text-blue-700 text-sm sm:text-base">Web Development Courses:</p>
                        <p className="text-gray-700 text-xs sm:text-sm">Frontend (HTML, CSS, JavaScript, React), Backend (Node.js, PHP, Python), Database Management, API Development</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700 text-sm sm:text-base">Specialized Tracks:</p>
                        <p className="text-gray-700 text-xs sm:text-sm">Mobile App Development, Cloud Computing, DevOps, Data Science Fundamentals</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 rounded-lg p-3 sm:p-4 border border-blue-100">
                    <p className="font-semibold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">Why Choose Paarsh Edu:</p>
                    <ul className="grid grid-cols-1 xs:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-gray-700">
                      {[
                        "Industry-experienced instructors",
                        "Project-based curriculum",
                        "Recognized certification",
                        "Flexible learning paths", 
                        "Career counseling services",
                        "Placement assistance",
                        "Affordable fee structure",
                        "Personalized mentorship"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center">
                          <ChevronRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <p className="font-semibold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">Our Learning Approach:</p>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex items-start">
                        <ChevronRight size={14} className="text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                        <span>Conceptual clarity through interactive sessions</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight size={14} className="text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                        <span>Practical implementation with real-world projects</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight size={14} className="text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                        <span>Code reviews and optimization techniques</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight size={14} className="text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                        <span>Collaborative learning environment</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100">
                      <p className="font-medium text-blue-700 text-sm">Course Duration:</p>
                      <p className="text-gray-700 text-xs sm:text-sm">3 months to 6 months (based on course)</p>
                    </div>
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100">
                      <p className="font-medium text-blue-700 text-sm">Learning Options:</p>
                      <p className="text-gray-700 text-xs sm:text-sm">Online, Offline, and Hybrid modes</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <p className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Student Success Journey:</p>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">1</div>
                        <p>Skill assessment and personalized learning plan</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">2</div>
                        <p>Core concept mastery and practical application</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">3</div>
                        <p>Project development with mentor guidance</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">4</div>
                        <p>Portfolio building and interview preparation</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">5</div>
                        <p>Certification and job placement support</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <p className="font-semibold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">Upcoming Batch Schedule:</p>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex flex-col xs:flex-row xs:justify-between text-xs sm:text-sm">
                        <p className="text-gray-700">Web Development (MERN Stack)</p>
                        <p className="text-blue-700 font-medium">August 15, 2023</p>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:justify-between text-xs sm:text-sm">
                        <p className="text-gray-700">Python Full Stack</p>
                        <p className="text-blue-700 font-medium">August 22, 2023</p>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:justify-between text-xs sm:text-sm">
                        <p className="text-gray-700">Java Enterprise Development</p>
                        <p className="text-blue-700 font-medium">September 5, 2023</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-blue-700 text-center font-medium text-sm sm:text-base">Enroll today and take the first step toward your tech career!</p>
                </div>
                
                <div className="flex justify-center mt-6 sm:mt-8 md:hidden">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg shadow-sm transition-colors text-sm sm:text-base font-medium" 
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
