import { Link } from "wouter";
import { Home } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="flex justify-between items-center mb-6 border-b border-accent pb-2">
        <h1 className="text-3xl text-accent">Terms & Conditions</h1>
        <Link href="/">
          <div className="text-primary hover:text-accent flex items-center gap-2 bg-black/60 border border-primary/30 px-4 py-2 rounded-md transition-colors cursor-pointer">
            <Home size={18} />
            <span>Return Home</span>
          </div>
        </Link>
      </div>
      
      <p className="mb-4 text-primary/90">
        Welcome to <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-transparent bg-clip-text">HackerAv's Lab</span>. By accessing and using this platform, you agree to the following terms:
      </p>

      <div className="space-y-3">
        {[
          "You may download and use resources from this site entirely at your own risk.",
          "We and our platform are not responsible for any misuse or illegal activity involving our content.",
          "We are not liable for any loss, damage, or harm resulting from the use of this platform.",
          "By continuing to use this site, you accept full responsibility for your actions."
        ].map((item, i) => (
          <div key={i} className="flex items-start">
            <span className="text-accent mr-2">&gt;</span>
            <p className="text-primary/80">{item}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-primary/70 italic text-center">
        <span className="text-purple-500">Inspire..... </span>
        <span className="text-yellow-500">Dare.....  </span>
        <span className="text-cyan-500">Hack....... </span>
      </p>
      
      <div className="mt-8 text-center">
        <Link href="/">
          <div className="inline-block text-primary hover:text-accent bg-black/60 border border-primary/30 px-6 py-3 rounded-md transition-colors cursor-pointer">
            Got It !!
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Terms;
