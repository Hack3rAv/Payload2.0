import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { uploadPayload } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';

interface UploadFormProps {
  onClose: () => void;
}

interface SelectedFile {
  file: File;
  id: string;
}

const UploadForm = ({ onClose }: UploadFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [framework, setFramework] = useState('');
  const [description, setDescription] = useState('');
  const [listeningDetails, setListeningDetails] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: `${file.name}-${Date.now()}`
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-accent');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-accent');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-accent');
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        file,
        id: `${file.name}-${Date.now()}`
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one payload file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!framework) {
      toast({
        title: 'Framework required',
        description: 'Please select the payload framework.',
        variant: 'destructive',
      });
      return;
    }

    if (!description) {
      toast({
        title: 'Description required',
        description: 'Please provide a description for the payload.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!listeningDetails) {
      toast({
        title: 'Listening details required',
        description: 'Please provide the listening IP:Port or URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload each file sequentially
      for (const { file } of selectedFiles) {
        await uploadPayload({
          file,
          framework,
          description,
          listeningDetails,
        });
      }

      // Reset form and refresh payloads list
      setSelectedFiles([]);
      setFramework('');
      setDescription('');
      setListeningDetails('');
      queryClient.invalidateQueries({ queryKey: ['/api/payloads'] });
      
      toast({
        title: 'Upload successful',
        description: 'All payloads were uploaded successfully.',
      });
      
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload one or more payloads. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-primary/30 rounded-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-primary font-terminal text-2xl">UPLOAD NEW PAYLOAD</h3>
        <button 
          onClick={onClose} 
          className="text-primary hover:text-white transition"
          disabled={isUploading}
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div 
          className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            id="payloadFiles" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple 
            className="hidden" 
          />
          <label htmlFor="payloadFiles" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-primary/60" />
            <p className="text-primary mt-2 font-mono">Drag files here or click to browse</p>
            <p className="text-gray-400 text-sm font-mono mt-1">Supports multiple files</p>
          </label>
        </div>

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 font-mono text-sm">
            {selectedFiles.map(({ file, id }) => (
              <div key={id} className="flex justify-between items-center bg-[#1e1e1e] p-2 rounded">
                <div>
                  <span className="text-white">{file.name}</span>
                  <span className="text-gray-400 ml-2">({formatFileSize(file.size)})</span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRemoveFile(id)} 
                  className="text-red-500 hover:text-red-400"
                  disabled={isUploading}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Payload Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="framework" className="block text-white font-mono text-sm mb-2">Framework</label>
            <select 
              id="framework" 
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="bg-[#1e1e1e] border border-primary/50 text-primary font-mono w-full px-3 py-2 rounded focus:outline-none focus:border-primary"
              disabled={isUploading}
            >
              <option value="">Select Framework</option>
              <option value="Android">Android</option>
              <option value="Windows">Windows</option>
              <option value="Linux">Linux</option>
              <option value="PHP">PHP</option>
              <option value="macOS">macOS</option>
              <option value="iOS">iOS</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="listeningDetails" className="block text-white font-mono text-sm mb-2">Listening IP:Port / URL</label>
            <input 
              type="text" 
              id="listeningDetails" 
              value={listeningDetails}
              onChange={(e) => setListeningDetails(e.target.value)}
              className="bg-[#1e1e1e] border border-primary/50 text-primary font-mono w-full px-3 py-2 rounded focus:outline-none focus:border-primary" 
              placeholder="e.g., 192.168.1.5:4444"
              disabled={isUploading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-white font-mono text-sm mb-2">Description (uses)</label>
          <textarea 
            id="description" 
            rows={4} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#1e1e1e] border border-primary/50 text-primary font-mono w-full px-3 py-2 rounded focus:outline-none focus:border-primary" 
            placeholder="Describe the payload functionality..."
            disabled={isUploading}
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-primary text-black font-mono font-bold py-2 px-6 rounded hover:bg-primary/90 transition-colors"
            disabled={isUploading}
          >
            {isUploading ? 'UPLOADING...' : 'UPLOAD'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
