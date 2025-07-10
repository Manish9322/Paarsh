// components/TestSecurityWrapper.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addViolation, setFullscreen } from '../../src/lib/slices/testSlice';
import { useReportViolationMutation } from '../../src/services/api';


const TestSecurityWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { currentTest, violations, tabSwitchCount } = useSelector(state => state.test);
  const [reportViolation] = useReportViolationMutation();
  const [isVisible, setIsVisible] = useState(true);
  const warningShown = useRef(false);

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      dispatch(addViolation({ type: 'right_click' }));
      reportViolation({
        sessionId: currentTest?.sessionId,
        type: 'right_click',
        timestamp: new Date()
      });
    };

    // Disable common shortcuts
    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, etc.
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
        dispatch(addViolation({ type: 'shortcut_attempt' }));
      }
    };

    // Detect tab switch/visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
        dispatch(addViolation({ type: 'tab_switch' }));
        reportViolation({
          sessionId: currentTest?.sessionId,
          type: 'tab_switch',
          timestamp: new Date()
        });
      } else {
        setIsVisible(true);
      }
    };

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      dispatch(setFullscreen(isFullscreen));
      
      if (!isFullscreen && currentTest) {
        dispatch(addViolation({ type: 'fullscreen_exit' }));
        reportViolation({
          sessionId: currentTest?.sessionId,
          type: 'fullscreen_exit',
          timestamp: new Date()
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [currentTest, dispatch, reportViolation]);

  // Auto-disqualify after too many violations
  useEffect(() => {
    if (tabSwitchCount >= 3 && !warningShown.current) {
      warningShown.current = true;
      alert('Warning: Too many tab switches detected. Your test may be terminated.');
    }
    
    if (tabSwitchCount >= 5) {
      // Auto-submit test
      window.location.href = '/test/disqualified';
    }
  }, [tabSwitchCount]);

  // Request fullscreen on mount
  useEffect(() => {
    if (currentTest) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  }, [currentTest]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Test Paused</h2>
          <p>Please return to the test tab to continue.</p>
          <p className="mt-2">Tab switches: {tabSwitchCount}/5</p>
        </div>
      </div>
    );
  }

  return children;
};

export default TestSecurityWrapper;