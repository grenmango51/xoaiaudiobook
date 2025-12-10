import { MoreVertical, PlusSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface AndroidInstallGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AndroidInstallGuide({ open, onOpenChange }: AndroidInstallGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Install on Android</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground text-sm">
            Install this app on your home screen for the best experience with offline support.
          </p>
          
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              1
            </div>
            <div className="space-y-1">
              <p className="font-medium">Tap the menu button</p>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MoreVertical className="h-5 w-5" />
                <span>three dots in the top right of Chrome</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              2
            </div>
            <div className="space-y-1">
              <p className="font-medium">Tap "Install app" or "Add to Home screen"</p>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <PlusSquare className="h-5 w-5" />
                <span>in the menu options</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              3
            </div>
            <div className="space-y-1">
              <p className="font-medium">Tap "Install" to confirm</p>
              <p className="text-muted-foreground text-sm">
                The app will appear on your home screen
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
