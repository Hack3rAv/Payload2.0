import { Payload } from '@shared/schema';
import { getDownloadUrl } from '@/lib/api';

interface PayloadItemProps {
  payload: Payload;
}

const PayloadItem = ({ payload }: PayloadItemProps) => {
  return (
    <div className="payload-item border-b border-primary/20 py-4 group">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-2 md:mb-0">
          <h4 className="text-white font-mono text-lg font-semibold group-hover:text-primary transition-colors">
            {payload.originalName}
          </h4>
          <p className="text-gray-400 font-mono text-sm mt-1">Framework: {payload.framework}</p>
        </div>
        <div className="flex items-center">
          <a 
            href={getDownloadUrl(payload.id)} 
            className="bg-[#1e1e1e] border border-primary text-primary px-4 py-1 rounded font-mono text-sm hover:bg-primary hover:text-black transition-colors"
            download={payload.originalName}
          >
            Download
          </a>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-gray-300 font-mono text-sm">{payload.description}</p>
        <p className="text-primary/70 font-mono text-xs mt-1">Listening on: {payload.listeningDetails}</p>
      </div>
    </div>
  );
};

export default PayloadItem;
