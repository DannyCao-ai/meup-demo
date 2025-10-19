import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleStart = () => {
    if (isAuthenticated) {
      setLocation("/onboarding");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container max-w-4xl text-center px-4 animate-fade-in">
        <img 
          src="/assets/images/mascot_cat.png" 
          alt="MeUp Mascot" 
          className="w-32 h-32 mx-auto mb-8 animate-pulse-soft"
        />
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Welcome to <span className="text-primary">MeUp</span>
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Discover your personalized learning path with AI-powered assessments. 
          Master skills like Active Listening and Memory through interactive role-play scenarios.
        </p>
        <Button 
          onClick={handleStart}
          size="lg"
          className="text-lg px-8 py-6"
        >
          Start Your Learning Journey
        </Button>
      </div>
    </div>
  );
}

