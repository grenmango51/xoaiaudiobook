import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Copy, Check, Smartphone, Monitor, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  syncCode: string | null;
  isConnected: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  onCreateCode: () => Promise<string | null>;
  onJoinCode: (code: string) => Promise<boolean>;
  onDisconnect: () => void;
  onPush: () => void;
  onPull: () => void;
}

export function SyncDialog({
  open,
  onOpenChange,
  syncCode,
  isConnected,
  isSyncing,
  lastSynced,
  onCreateCode,
  onJoinCode,
  onDisconnect,
  onPush,
  onPull,
}: SyncDialogProps) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const { toast } = useToast();

  const handleCopyCode = async () => {
    if (syncCode) {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Sync code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreate = async () => {
    const code = await onCreateCode();
    if (code) {
      setMode('menu');
    }
  };

  const handleJoin = async () => {
    const success = await onJoinCode(inputCode);
    if (success) {
      setInputCode('');
      setMode('menu');
    }
  };

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSynced.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    return lastSynced.toLocaleTimeString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Across Devices
          </DialogTitle>
          <DialogDescription>
            {isConnected 
              ? 'Your library syncs across all linked devices'
              : 'Link your devices to sync playback progress and bookmarks'}
          </DialogDescription>
        </DialogHeader>

        {isConnected ? (
          <div className="space-y-4">
            {/* Sync Code Display */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your sync code</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-bold tracking-tight flex-1 break-all">
                  {syncCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Copy this code and paste it on your other devices to link them
              </p>
            </div>

            {/* Sync Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last synced:</span>
              <span>{formatLastSynced()}</span>
            </div>

            {/* Sync Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onPush}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Push to Cloud
              </Button>
              <Button
                variant="outline"
                onClick={onPull}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Pull from Cloud
              </Button>
            </div>

            {isSyncing && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing...
              </div>
            )}

            {/* Disconnect */}
            <Button
              variant="ghost"
              onClick={onDisconnect}
              className="w-full text-destructive hover:text-destructive"
            >
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect Sync
            </Button>
          </div>
        ) : mode === 'menu' ? (
          <div className="space-y-3">
            <Button
              variant="default"
              onClick={() => setMode('create')}
              className="w-full h-auto py-4 flex-col items-start"
            >
              <span className="font-semibold">Create New Sync Code</span>
              <span className="text-xs opacity-80">Set up sync on your first device</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setMode('join')}
              className="w-full h-auto py-4 flex-col items-start"
            >
              <span className="font-semibold">Enter Existing Code</span>
              <span className="text-xs opacity-80">Link this device to an existing sync</span>
            </Button>
          </div>
        ) : mode === 'create' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a secure sync code that you'll copy to your other devices.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode('menu')}>
                Back
              </Button>
              <Button onClick={handleCreate} className="flex-1">
                Generate Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste sync code</label>
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toLowerCase())}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="text-xs font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode('menu')}>
                Back
              </Button>
              <Button 
                onClick={handleJoin} 
                className="flex-1"
                disabled={inputCode.length < 36}
              >
                Connect
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
