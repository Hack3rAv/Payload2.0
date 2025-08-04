import { useEffect } from 'react';
import { Link } from 'wouter';
import { Download, Shield } from 'lucide-react';

const PublicPage = () => {
  // Secret key combination to navigate to admin (Ctrl+Alt+A)
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'a') {
        window.location.href = '/admin/login';
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-primary/30">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-primary font-terminal text-3xl md:text-4xl animate-pulse">
              HackerAv's Lab <span className="text-accent">[Error]</span>
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
            <Link href="/payloads" className="flex items-center bg-[#1e1e1e] border border-primary text-primary px-4 py-2 rounded font-mono text-sm hover:bg-primary hover:text-black transition-colors">
              <Download size={16} className="mr-2" />
              Payloads
            </Link>
            <Link href="/admin/login" className="flex items-center bg-[#1e1e1e] border border-primary/50 text-primary/80 px-4 py-2 rounded font-mono text-sm hover:bg-[#2a2a2a] transition-colors">
              <Shield size={16} className="mr-2" />
              Access
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="glitch-text text-primary font-terminal text-4xl md:text-6xl mb-10" 
              data-text="DARE TO DOWNLOAD"
            >
              DARE TO DOWNLOAD
            </h2>
            <div className="relative mb-12 max-w-3xl mx-auto">
              <p className="text-white font-mono text-xl md:text-2xl leading-relaxed whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                You dared to come here means you have enough guts...
              </p>
              <p className="text-white/80 font-mono text-xl md:text-2xl mt-4">
                Hackers are inaccessible...
              </p>
              <p className="text-accent font-mono text-xl md:text-2xl mt-4 font-bold">
                You Are Infected.
              </p>
              <span className="terminal-cursor text-primary"></span>
            </div>

            <div className="mt-16 flex justify-center gap-10">
              <Link href="/payloads" className="bg-primary text-black font-terminal font-bold py-3 px-8 rounded-md text-lg hover:bg-primary/90 transition-colors">
                ENTER THE LAB
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-primary/30">
        <div className="container mx-auto px-4">
          <p className="text-primary font-mono text-xs text-center">[connection_encrypted] :: system.access_log = [REDACTED]</p>
          <p className="text-primary font-mono text-xs text-center">
            <Link href="/terms">
              <span className="text-[deeppink]">Terms </span>
              <span className="text-green-500">& </span>
              <span className="text-cyan-500">Condition</span>
            </Link>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default PublicPage;
