import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Store the event globally in case it fires before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

// Track if prompt was attempted (persists across refreshes via sessionStorage)
const PROMPT_ATTEMPTED_KEY = 'pwa-prompt-attempted';

// Set up global listener immediately
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    // Clear the attempted flag when we get a fresh prompt
    sessionStorage.removeItem(PROMPT_ATTEMPTED_KEY);
    console.log('PWA: beforeinstallprompt event captured globally');
  });
}

function detectIOS(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
    (userAgent.includes('mac') && 'ontouchend' in document);
}

function detectAndroid(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [promptAvailable, setPromptAvailable] = useState(!!globalDeferredPrompt);

  useEffect(() => {
    const ios = detectIOS();
    const android = detectAndroid();
    setIsIOS(ios);
    setIsAndroid(android);

    // Check if already installed
    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    // Always show install button on mobile devices (we'll show instructions if prompt not available)
    if (ios || android) {
      setIsInstallable(true);
    }

    // Check if we already have a deferred prompt from global capture
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
      setPromptAvailable(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = prompt;
      setDeferredPrompt(prompt);
      setPromptAvailable(true);
      setIsInstallable(true);
      console.log('PWA: beforeinstallprompt event captured in hook');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setPromptAvailable(false);
      globalDeferredPrompt = null;
      sessionStorage.removeItem(PROMPT_ATTEMPTED_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) {
      return 'unavailable';
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      // Mark that we attempted the prompt
      sessionStorage.setItem(PROMPT_ATTEMPTED_KEY, 'true');
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      // Clear the prompt - it can only be used once
      setDeferredPrompt(null);
      setPromptAvailable(false);
      globalDeferredPrompt = null;
      
      return outcome;
    } catch (error) {
      console.error('PWA install error:', error);
      return 'unavailable';
    }
  };

  return { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid,
    promptAvailable,
    installApp 
  };
}
