import { useState, useRef } from 'react';
import { Upload, Music, X, FileAudio } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { cn } from '@/lib/utils';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = '.mp3,.m4a,.m4b,.ogg,.wav,.opus';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|m4a|m4b|ogg|wav|opus)$/i)
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      onOpenChange(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add Audiobooks</DialogTitle>
          <DialogDescription>
            Upload MP3, M4A, M4B, OGG, or WAV files from your computer
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className={cn(
            'rounded-full p-4 transition-colors',
            dragActive ? 'bg-primary/20' : 'bg-secondary'
          )}>
            <Upload className={cn(
              'h-8 w-8 transition-colors',
              dragActive ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {dragActive ? 'Drop files here' : 'Drag & drop audio files'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {['MP3', 'M4A', 'M4B', 'OGG', 'WAV'].map((format) => (
              <span
                key={format}
                className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="max-h-48 space-y-2 overflow-auto">
            <p className="text-sm font-medium text-foreground">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
              >
                <FileAudio className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedFiles([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={selectedFiles.length === 0}
            onClick={handleUpload}
          >
            <Music className="h-4 w-4 mr-2" />
            Add {selectedFiles.length > 0 ? selectedFiles.length : ''} Book{selectedFiles.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
