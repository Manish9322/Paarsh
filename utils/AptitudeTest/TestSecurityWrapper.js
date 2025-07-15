// components/TestSecurityWrapper.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addViolation, setFullscreen } from '../../src/lib/slices/testSlice';
import { useReportViolationMutation } from '../../src/services/api';
import { toast } from 'sonner';

/**
 * @typedef {Object} TestSecurityWrapperProps
 * @property {React.ReactNode} children - Child components
 * @property {() => Promise<void>} onSubmit - Callback when test needs to be submitted
 */

/**
 * Security wrapper component for the test environment
 * @param {TestSecurityWrapperProps} props
 */
const TestSecurityWrapper = ({ children, onSubmit }) => {
  const dispatch = useDispatch();
  const { currentTest, violations, tabSwitchCount } = useSelector(state => state.test);
  const [reportViolation] = useReportViolationMutation();
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const violationCount = useRef(0);
  const lastViolationTime = useRef(0);
  const isFullscreenRef = useRef(true);
  const MAX_VIOLATIONS = 10; // Maximum violations before auto-submit
  const VIOLATION_COOLDOWN = 2000; // 2 seconds cooldown between violations

  /**
   * Handle security violations
   * @param {string} type - Type of violation
   */
  const handleViolation = async (type) => {
    // Don't count violations if already submitting
    if (isSubmitting) return;

    const now = Date.now();
    // Prevent multiple violations in quick succession
    if (now - lastViolationTime.current < VIOLATION_COOLDOWN) {
      return;
    }
    lastViolationTime.current = now;

    violationCount.current += 1;
    
    try {
      dispatch(addViolation({ type }));
      await reportViolation({
        sessionId: currentTest?.sessionId,
        type,
        timestamp: new Date(),
        count: violationCount.current
      }).unwrap();

      let warningMessage = '';
      switch (type) {
        case 'tab_switch':
          warningMessage = 'Tab switching detected!';
          break;
        case 'fullscreen_exit':
          warningMessage = 'Exiting fullscreen mode detected!';
          break;
        default:
          warningMessage = 'Test security violation detected!';
      }

      // Show warning with current violation count
      toast.warning(
        `Warning ${violationCount.current}/${MAX_VIOLATIONS}: ${warningMessage}`,
        {
          duration: 3000,
          position: 'top-center'
        }
      );

      // Auto-submit on max violations
      if (violationCount.current >= MAX_VIOLATIONS && !isSubmitting) {
        setIsSubmitting(true);
        toast.error("Maximum violations (10) reached. Test will be auto-submitted.", {
          duration: 5000,
          position: 'top-center'
        });
        try {
          await onSubmit();
        } catch (error) {
          console.error('Error auto-submitting test:', error);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('Error handling violation:', error);
    }
  };

  // Function to check fullscreen state
  const checkFullscreenState = () => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  // Function to request fullscreen
  const requestFullscreen = async () => {
    if (!isSubmitting) {
      const element = document.documentElement;
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
        isFullscreenRef.current = true;
      } catch (error) {
        console.error('Error requesting fullscreen:', error);
      }
    }
  };

  useEffect(() => {
    let fullscreenChangeTimeout;

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      handleViolation('right_click');
    };

    // Disable common shortcuts
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'x')
      ) {
        e.preventDefault();
        handleViolation('shortcut_attempt');
      }
    };

    // Detect tab switch/visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
        handleViolation('tab_switch');
      } else {
        setIsVisible(true);
      }
    };

    // Fullscreen change handler with debounce
    const handleFullscreenChange = () => {
      if (isSubmitting) return; // Don't handle fullscreen changes if submitting

      clearTimeout(fullscreenChangeTimeout);
      
      const isFullscreen = checkFullscreenState();
      dispatch(setFullscreen(isFullscreen));
      
      if (!isFullscreen && currentTest && isFullscreenRef.current) {
        isFullscreenRef.current = false;
        handleViolation('fullscreen_exit');
        
        // Try to re-enter fullscreen after a short delay
        fullscreenChangeTimeout = setTimeout(() => {
          if (!isSubmitting && !checkFullscreenState()) {
            requestFullscreen();
          }
        }, 1000);
      } else if (isFullscreen) {
        isFullscreenRef.current = true;
      }
    };

    // Initial fullscreen request
    if (currentTest && !isSubmitting) {
      requestFullscreen();
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      clearTimeout(fullscreenChangeTimeout);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [currentTest, dispatch, reportViolation, handleViolation, isSubmitting]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Test Paused</h2>
          <p>Please return to the test tab to continue.</p>
          <p className="mt-2">Warning {violationCount.current}/{MAX_VIOLATIONS}</p>
          <p className="text-sm mt-2">Your test will be auto-submitted after {MAX_VIOLATIONS} violations.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default TestSecurityWrapper;