import { Payload } from '@shared/schema';
import { getDownloadUrl, deletePayload } from '@/lib/api';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Trash2 } from 'lucide-react';

interface AdminPayloadTableProps {
  payloads: Payload[];
}

const AdminPayloadTable = ({ payloads }: AdminPayloadTableProps) => {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this payload?')) {
      try {
        setIsDeleting(id);
        await deletePayload(id);
        queryClient.invalidateQueries({ queryKey: ['/api/payloads'] });
        toast({
          title: 'Payload deleted',
          description: 'The payload has been removed successfully.',
        });
      } catch (error) {
        console.error('Failed to delete payload:', error);
        toast({
          title: 'Deletion failed',
          description: 'Failed to delete the payload. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(null);
      }
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
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono text-sm">
        <thead className="text-primary border-b border-primary/30">
          <tr>
            <th className="pb-3 pr-4">Filename</th>
            <th className="pb-3 pr-4">Framework</th>
            <th className="pb-3 pr-4">Listening On</th>
            <th className="pb-3 pr-4">Size</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payloads.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                No payloads uploaded yet
              </td>
            </tr>
          ) : (
            payloads.map((payload) => (
              <tr key={payload.id} className="border-b border-primary/10 hover:bg-[#1e1e1e]/50">
                <td className="py-3 pr-4 text-white">{payload.originalName}</td>
                <td className="py-3 pr-4 text-gray-300">{payload.framework}</td>
                <td className="py-3 pr-4 text-primary/80">{payload.listeningDetails}</td>
                <td className="py-3 pr-4 text-gray-300">{formatFileSize(payload.fileSize)}</td>
                <td className="py-3 flex space-x-2">
                  <a 
                    href={getDownloadUrl(payload.id)} 
                    className="text-primary hover:text-white transition"
                    download={payload.originalName}
                  >
                    <Download size={20} />
                  </a>
                  <button 
                    className="text-red-500 hover:text-red-400 transition"
                    onClick={() => handleDelete(payload.id)}
                    disabled={isDeleting === payload.id}
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPayloadTable;
