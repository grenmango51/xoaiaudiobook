import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Music, X, FileAudio, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  scanFolderForAudiobooks, 
  supportsDirectoryPicker,
  groupFilesByFolder,
  type ScannedBook 
} from '@/utils/folderScanner';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
  onFolderImport?: (books: ScannedBook[]) => void;
  defaultTab?: 'folder' | 'files';
}

export function UploadDialog({ open, onOpenChange, onUpload, onFolderImport, defaultTab = 'folder' }: UploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const inputRef = useRef<HTMLInputElement>(null);

  // Folder scan state
  const [scanning, setScanning] = useState(false);
  const [scannedBooks, setScannedBooks] = useState<ScannedBook[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  const acceptedTypes = '.mp3,.m4a,.m4b,.ogg,.wav,.opus';
  const supportsAPI = supportsDirectoryPicker();

  // Sync activeTab with defaultTab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

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

  // Folder scanning functions
  const handleScanFolder = useCallback(async () => {
    setScanning(true);
    
    try {
      const result = await scanFolderForAudiobooks();
      if (result) {
        setScannedBooks(result.books);
        setSelectedBooks(new Set(result.books.map(b => b.folderName)));
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFallbackFolderInput = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        setScanning(true);
        const files = Array.from(input.files);
        const books = groupFilesByFolder(files);
        setScannedBooks(books);
        setSelectedBooks(new Set(books.map(b => b.folderName)));
        setScanning(false);
      }
    };
    
    input.click();
  }, []);

  const toggleBook = useCallback((folderName: string) => {
    setSelectedBooks(prev => {
      const next = new Set(prev);
      if (next.has(folderName)) {
        next.delete(folderName);
      } else {
        next.add(folderName);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedBooks.size === scannedBooks.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(scannedBooks.map(b => b.folderName)));
    }
  }, [selectedBooks.size, scannedBooks]);

  const handleFolderImport = useCallback(() => {
    if (onFolderImport) {
      const booksToImport = scannedBooks.filter(b => selectedBooks.has(b.folderName));
      onFolderImport(booksToImport);
    }
    setScannedBooks([]);
    setSelectedBooks(new Set());
    onOpenChange(false);
  }, [scannedBooks, selectedBooks, onFolderImport, onOpenChange]);

  const handleClose = useCallback(() => {
    setSelectedFiles([]);
    setScannedBooks([]);
    setSelectedBooks(new Set());
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add Audiobooks</DialogTitle>
          <DialogDescription>
            Scan a folder or upload individual audio files
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="folder" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Scan Folder
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <FileAudio className="h-4 w-4" />
              Select Files
            </TabsTrigger>
          </TabsList>

          {/* Folder Scan Tab */}
          <TabsContent value="folder" className="space-y-4 mt-4">
            {scannedBooks.length === 0 ? (
              <div className="space-y-4">
                <Button 
                  onClick={supportsAPI ? handleScanFolder : handleFallbackFolderInput}
                  disabled={scanning}
                  className="w-full"
                  size="lg"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Select Audiobooks Folder
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Each subfolder becomes a separate audiobook.<br />
                  Like Smart Audiobook Player!
                </p>
                
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Recommended folder structure:</p>
                  <code className="block bg-background/50 rounded p-2 mt-1">
                    📁 Audiobooks/<br />
                    &nbsp;&nbsp;📁 Book Title 1/<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;🎵 chapter1.mp3<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;🎵 chapter2.mp3<br />
                    &nbsp;&nbsp;📁 Book Title 2/<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;🎵 part1.m4b
                  </code>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Found {scannedBooks.length} audiobook{scannedBooks.length !== 1 ? 's' : ''}
                  </span>
                  <Button variant="ghost" size="sm" onClick={toggleAll}>
                    {selectedBooks.size === scannedBooks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="space-y-2">
                    {scannedBooks.map((book) => (
                      <label
                        key={book.folderName}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedBooks.has(book.folderName)}
                          onCheckedChange={() => toggleBook(book.folderName)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{book.folderName}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Music className="h-3 w-3" />
                            {book.files.length} file{book.files.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setScannedBooks([]);
                      setSelectedBooks(new Set());
                    }} 
                    className="flex-1"
                  >
                    Rescan
                  </Button>
                  <Button 
                    onClick={handleFolderImport} 
                    disabled={selectedBooks.size === 0}
                    className="flex-1"
                  >
                    <Music className="mr-2 h-4 w-4" />
                    Import {selectedBooks.size} Book{selectedBooks.size !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="files" className="space-y-4 mt-4">
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer',
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
                'rounded-full p-3 transition-colors',
                dragActive ? 'bg-primary/20' : 'bg-secondary'
              )}>
                <Upload className={cn(
                  'h-6 w-6 transition-colors',
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

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['MP3', 'M4A', 'M4B', 'OGG', 'WAV'].map((format) => (
                  <span
                    key={format}
                    className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>
                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2"
                      >
                        <FileAudio className="h-4 w-4 flex-shrink-0 text-primary" />
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
                </ScrollArea>

                <Button
                  className="w-full"
                  disabled={selectedFiles.length === 0}
                  onClick={handleUpload}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Add {selectedFiles.length} Book{selectedFiles.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
