import { FileAudio, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

export interface FileUploadStatus {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface UploadProgressProps {
  files: FileUploadStatus[];
  className?: string;
}

export function UploadProgress({ files, className }: UploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const completedCount = files.filter(f => f.status === 'complete').length;
  const totalProgress = files.length > 0
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
    : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Overall progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Importing audiobooks...
          </span>
          <span className="text-muted-foreground">
            {completedCount}/{files.length}
          </span>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>

      {/* Individual file progress */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg transition-colors',
              file.status === 'complete' && 'bg-green-500/10',
              file.status === 'error' && 'bg-destructive/10',
              (file.status === 'pending' || file.status === 'processing') && 'bg-secondary/50'
            )}
          >
            {/* Status icon */}
            <div className="flex-shrink-0">
              {file.status === 'pending' && (
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              )}
              {file.status === 'processing' && (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              )}
              {file.status === 'complete' && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {file.status === 'error' && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                {file.status === 'error' && file.error && (
                  <span className="text-xs text-destructive truncate">
                    {file.error}
                  </span>
                )}
              </div>
            </div>

            {/* Progress for processing files */}
            {file.status === 'processing' && (
              <div className="w-16">
                <Progress value={file.progress} className="h-1.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
