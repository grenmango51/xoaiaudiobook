import { useState } from 'react';
import { Headphones, Settings, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { IOSInstallGuide } from './IOSInstallGuide';
import { AndroidInstallGuide } from './AndroidInstallGuide';
import { toast } from 'sonner';

interface HeaderProps {
  onUpload: () => void;
}

export function Header({ onUpload }: HeaderProps) {
  const { isInstallable, isIOS, isAndroid, promptAvailable, installApp } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (isAndroid && promptAvailable) {
      const result = await installApp();
      if (result === 'accepted') {
        toast.success('App installed! Find it on your home screen.');
      } else if (result === 'dismissed') {
        toast.info('Installation cancelled. Tap Install App to try again.');
        // Show manual instructions since prompt won't be available again
        setShowAndroidGuide(true);
      } else {
        // Prompt not available, show manual instructions
        setShowAndroidGuide(true);
      }
    } else if (isAndroid) {
      // No automatic prompt available, show manual instructions
      setShowAndroidGuide(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Headphones className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Audiobook Player
              </h1>
              <p className="text-xs text-muted-foreground">Your personal library</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isInstallable && (
              <Button
                variant="default"
                size="sm"
                onClick={handleInstallClick}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Install App</span>
              </Button>
            )}
            <IOSInstallGuide open={showIOSGuide} onOpenChange={setShowIOSGuide} />
            <AndroidInstallGuide open={showAndroidGuide} onOpenChange={setShowAndroidGuide} />
            <Button
              variant="outline"
              size="sm"
              onClick={onUpload}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Add Books</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
