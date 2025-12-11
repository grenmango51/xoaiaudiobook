import { useState } from 'react';
import { Headphones, Settings, Upload, Download, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { IOSInstallGuide } from './IOSInstallGuide';
import { AndroidInstallGuide } from './AndroidInstallGuide';
import { toast } from 'sonner';

interface HeaderProps {
  onScanFolder: () => void;
  onUploadFiles: () => void;
  onOpenSync?: () => void;
  isSyncConnected?: boolean;
}

export function Header({ onScanFolder, onUploadFiles, onOpenSync, isSyncConnected }: HeaderProps) {
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
        setShowAndroidGuide(true);
      } else {
        setShowAndroidGuide(true);
      }
    } else if (isAndroid) {
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
            
            {/* Primary action - Access Folder */}
            <Button
              variant="default"
              size="sm"
              onClick={onScanFolder}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Add Books</span>
            </Button>
            
            {/* Secondary action - Upload Files */}
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadFiles}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </Button>
            
            {/* Sync button */}
            {onOpenSync && (
              <Button
                variant={isSyncConnected ? "default" : "ghost"}
                size="icon"
                onClick={onOpenSync}
                className={isSyncConnected ? "bg-green-600 hover:bg-green-700" : ""}
                title={isSyncConnected ? "Sync connected" : "Set up sync"}
              >
                <RefreshCw className={`h-5 w-5 ${isSyncConnected ? "text-white" : ""}`} />
              </Button>
            )}
            
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
