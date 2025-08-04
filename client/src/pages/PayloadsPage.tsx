import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPayloads } from '@/lib/api';
import { Link } from 'wouter';
import { Terminal, ChevronLeft, Eye, Download } from 'lucide-react';
import { Payload } from '@shared/schema';

const PayloadsPage = () => {
  const { data: payloads, isLoading, error } = useQuery({ 
    queryKey: ['/api/payloads'],
    queryFn: fetchPayloads
  });
  
  // State to track which payload detail is currently being viewed
  const [selectedPayload, setSelectedPayload] = useState<Payload | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-primary/30">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-primary font-terminal text-3xl md:text-4xl animate-pulse">
              HackerAv's Lab <span className="text-accent">[Payload]</span>
            </h1>
            <p className="font-terminal text-lg animate-pulse flex flex-wrap gap-x-1">
              <span className="text-[deeppink]">Punishment</span>
              <span className="text-green-500">with</span>
              <span className="text-cyan-500">no</span>
              <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-transparent bg-clip-text">
                Mercy
              </span>
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="text-primary/80 font-mono text-sm hover:text-primary">
              <ChevronLeft size={16} className="inline mr-1" />
              Back to Main
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="glitch-text text-primary font-terminal text-3xl md:text-4xl mb-8 text-center" 
            data-text="PAYLOADS ARSENAL"
          >
            PAYLOADS ARSENAL
          </h2>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payload List Section */}
            <div className="lg:col-span-1">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-primary/30 rounded-md p-4">
                <h3 className="text-primary font-terminal text-xl mb-4">SELECT PAYLOAD</h3>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <Terminal className="animate-pulse w-12 h-12 mx-auto text-primary mb-2" />
                    <p className="text-primary/70 font-mono">Loading payload data...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500 font-mono">
                    <p>Connection failed. System error encountered.</p>
                  </div>
                ) : payloads && payloads.length > 0 ? (
                  <div className="space-y-2">
                    {payloads.map((payload) => (
                      <div 
                        key={payload.id} 
                        className={`border border-primary/20 rounded p-3 cursor-pointer transition-colors ${
                          selectedPayload?.id === payload.id ? 'bg-primary/10 border-primary' : 'hover:bg-[#1e1e1e]/50'
                        }`}
                        onClick={() => setSelectedPayload(payload)}
                      >
                        <h4 className="font-mono text-white truncate">{payload.originalName}</h4>
                        <p className="text-primary/70 font-mono text-xs mt-1">{payload.framework}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-mono">No payloads available at this time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payload Details Section */}
            <div className="lg:col-span-2">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-primary/30 rounded-md p-4 md:p-6 h-full">
                {selectedPayload ? (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-primary font-terminal text-2xl">{selectedPayload.originalName}</h3>
                      <div>
                        <a 
                          href={`/api/download/${selectedPayload.id}`} 
                          className="flex items-center bg-primary text-black px-4 py-2 rounded font-mono font-bold hover:bg-primary/90 transition-colors"
                          download={selectedPayload.originalName}
                        >
                          <Download size={16} className="mr-2" />
                          Download
                        </a>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#1e1e1e]/50 p-3 rounded border border-primary/20">
                          <p className="text-gray-400 font-mono text-sm">Framework</p>
                          <p className="text-white font-mono">{selectedPayload.framework}</p>
                        </div>
                        <div className="bg-[#1e1e1e]/50 p-3 rounded border border-primary/20">
                          <p className="text-gray-400 font-mono text-sm">File Size</p>
                          <p className="text-white font-mono">{formatFileSize(selectedPayload.fileSize)}</p>
                        </div>
                      </div>

                      <div className="bg-[#1e1e1e]/50 p-4 rounded border border-primary/20">
                        <p className="text-gray-400 font-mono text-sm mb-2">Listening Details</p>
                        <p className="text-primary font-mono font-bold">{selectedPayload.listeningDetails}</p>
                      </div>

                      <div className="bg-[#1e1e1e]/50 p-4 rounded border border-primary/20">
                        <p className="text-gray-400 font-mono text-sm mb-2">Description</p>
                        <p className="text-white font-mono whitespace-pre-line">{selectedPayload.description}</p>
                      </div>

                      <div className="border-t border-primary/20 pt-4 mt-8">
                        <p className="text-primary/70 font-mono text-xs">
                          Payload ID: {selectedPayload.id} | Added to system database
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <Eye className="w-16 h-16 text-primary/30 mb-4" />
                    <p className="text-primary/70 font-mono text-center">Select a payload from the list to view details</p>
                    <p className="text-primary/50 font-mono text-xs mt-2 text-center">All payloads include detailed usage instructions and connection data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-primary/30">
        <div className="container mx-auto px-4">
          <p className="text-primary font-mono text-xs text-center">
            [payload_system_active] :: Access level: public :: Request origin: {selectedPayload ? `payload.view.${selectedPayload.id}` : 'payload.list'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PayloadsPage;