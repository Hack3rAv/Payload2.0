import { useState, FormEvent, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, setLocation] = useLocation();

  const [ipInfo, setIpInfo] = useState({
    ip: '',
    city: '',
    region: '',
    country: '',
    org: '',
  });

  // Fetch IP and geolocation info
  useEffect(() => {
    const fetchIPData = async () => {
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        setIpInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country,
          org: data.connection?.isp || data.org || 'Unknown ISP',
        });
      } catch (error) {
        console.error('Failed to fetch IP info:', error);
      }
    };

    fetchIPData();
  }, []);

  // Use our auth context
  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirect to admin if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/admin');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!password) {
      setError('Password is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await login(password);

      if (success) {
        console.log('Login successful, redirecting soon...');
      } else {
        setIsSubmitting(false);
        setError('Invalid password. Try using "root"');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsSubmitting(false);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative bg-black">
      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-sm border border-primary/30 rounded-md p-6 md:p-8 relative z-40">
        <h2 className="text-primary font-terminal text-3xl mb-2 text-center">HackerAv's LAB</h2>
        <p className="font-terminal text-xl mb-2 text-center -mt-3">
          <span className="text-[deeppink]">Punishment </span>
          <span className="text-green-500">with </span>
          <span className="text-cyan-500">no </span>
          <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-transparent bg-clip-text">
            Mercy
          </span>
        </p>
        <p className="text-primary/60 font-mono text-xs mb-6 text-center">[ADMIN AUTHENTICATION REQUIRED]</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded flex items-center text-white font-mono text-sm">
            <AlertTriangle size={16} className="mr-2 text-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-50">
          <div>
            <label htmlFor="password" className="block text-white font-mono text-sm mb-2">Admin Password</label>
            <div className="relative z-10">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white font-mono text-base">&gt;</span>
  
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1e1e1e] border border-primary/50 text-primary font-mono w-full pl-8 pr-12 py-2 rounded focus:outline-none focus:border-primary relative z-50"
                placeholder="Enter password"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary hover:text-primary/80 z-50"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-primary text-black font-mono font-bold py-3 px-4 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 relative z-20 pointer-events-auto cursor-pointer border-2 border-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Initializing....' : 'AUTHENTICATE'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-primary font-mono text-sm hover:text-white inline-block py-2 px-4 border border-primary/40 rounded relative z-20 pointer-events-auto hover:bg-primary/10 transition-colors"
          >
            [Return to Home]
          </a>
        </div>

        {/* Debug info */}
        <div className="mt-4 text-xs text-primary/30 font-mono text-center">
          <p>Kali Root:SuperUser</p>
        </div>
      </div>

      {/* Terminal output with IP and geo info */}
      <div className="terminal-output mt-8 w-full max-w-md font-mono text-primary text-sm bg-[#0a0a0a]/60 border border-primary/30 p-4 rounded-md">
        <p>&gt; IP leaked... YourIP: {ipInfo.ip || "Loading..."}</p>
        <p>&gt; ISP: {ipInfo.org}</p>
        <p>&gt; Location: {ipInfo.city}, {ipInfo.region}, {ipInfo.country}</p>
        <p>&gt; Don't Dare to be Oversmart</p>
        <p>&gt; Your sensitive data is in our hands</p>
        <p className="flex">
          <span>&gt; Waiting for authentication..........</span>
          <span className="ml-1 animate-pulse duration-600">_</span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
