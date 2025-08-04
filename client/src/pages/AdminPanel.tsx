import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchPayloads } from '@/lib/api';
import AdminPayloadTable from '@/components/AdminPayloadTable';
import UploadForm from '@/components/UploadForm';
import { useLocation } from 'wouter';
import { LogOut, Upload, Server, Terminal } from 'lucide-react';

const AdminPanel = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [_, setLocation] = useLocation();
  
  const { data: payloads, isLoading, error } = useQuery({
    queryKey: ['/api/payloads'],
    queryFn: fetchPayloads
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  // Get current date and time for display
  const now = new Date();
  const formattedDate = now.toISOString().replace('T', ' ').split('.')[0];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0a0a0a] py-4 px-6 border-b border-primary/30">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-primary font-terminal text-3xl md:text-4xl animate-pulse">
              HackerAv's Lab <span className="text-accent">[ADMIN]</span>
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
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowUploadForm(true)} 
              className="text-primary font-mono text-sm border border-primary px-3 py-1 rounded hover:bg-primary hover:text-black transition-colors flex items-center"
            >
              <Upload size={16} className="mr-1" />
              Upload New
            </button>
            <button 
              onClick={handleLogout} 
              className="text-red-500 font-mono text-sm hover:text-red-400 transition flex items-center"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-primary/30 rounded-md p-4">
              <h3 className="text-primary font-terminal text-xl mb-4">SYSTEM STATUS</h3>
              <div className="space-y-3 font-mono text-sm">
                <div>
                  <p className="text-gray-400">Server Status:</p>
                  <p className="text-primary">OPERATIONAL</p>
                </div>
                <div>
                  <p className="text-gray-400">Payloads Hosted:</p>
                  <p className="text-primary">{payloads ? payloads.length : 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Storage:</p>
                  <div className="w-full bg-[#1e1e1e] rounded-full h-2.5 mt-1">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: payloads ? `${Math.min(100, payloads.length * 10)}%` : '0%' }}></div>
                  </div>
                  <p className="text-primary text-xs mt-1">
                    {payloads ? `${Math.min(100, payloads.length * 10)}%` : '0%'} used
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Last Login:</p>
                  <p className="text-primary">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current User:</p>
                  <p className="text-primary">{user?.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-primary/30 rounded-md p-4 md:p-6 mb-8">
              <h3 className="text-primary font-terminal text-2xl mb-6">PAYLOAD MANAGEMENT</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <Terminal className="animate-pulse w-12 h-12 mx-auto text-primary mb-2" />
                  <p className="text-primary/70 font-mono">Loading payload data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500 font-mono">
                  <p>Failed to load payloads. System error encountered.</p>
                </div>
              ) : (
                <AdminPayloadTable payloads={payloads || []} />
              )}
            </div>

            {/* Upload Form - Conditionally Shown */}
            {showUploadForm && (
              <UploadForm onClose={() => setShowUploadForm(false)} />
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-primary/30">
        <div className="container mx-auto px-4">
          <p className="text-primary font-mono text-xs text-center">[admin_session_active] :: Last action: {isLoading ? 'payload.list.loading' : error ? 'payload.list.error' : 'payload.list.refresh'}</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPanel;
