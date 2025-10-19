import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FAVORITE_TOPICS, AVAILABLE_SKILLS } from "@shared/content";
import { toast } from "sonner";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: "",
    favoriteTopics: [] as string[],
    selectedSkill: "",
    learningTime: "",
  });

  const saveOnboarding = trpc.onboarding.save.useMutation({
    onSuccess: () => {
      toast.success("Profile saved! Generating your personalized learning path...");
      setLocation(`/learning-path`);
    },
    onError: () => {
      toast.error("Failed to save profile.");
    }
  });

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteTopics: prev.favoriteTopics.includes(topic)
        ? prev.favoriteTopics.filter(t => t !== topic)
        : [...prev.favoriteTopics, topic]
    }));
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.userName) {
      toast.error("Please enter your name");
      return;
    }
    if (step === 2 && formData.favoriteTopics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }
    if (step === 3 && !formData.selectedSkill) {
      toast.error("Please select a skill");
      return;
    }
    if (step === 4 && !formData.learningTime) {
      toast.error("Please select learning time");
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      saveOnboarding.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <img src="/assets/images/mascot_cat.png" alt="Mascot" className="w-16 h-16" />
            <div>
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>Step {step} of 4</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label htmlFor="name">What is your name?</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>What topics interest you?</Label>
              <div className="grid grid-cols-2 gap-4">
                {FAVORITE_TOPICS.map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={topic}
                      checked={formData.favoriteTopics.includes(topic)}
                      onCheckedChange={() => handleTopicToggle(topic)}
                    />
                    <label htmlFor={topic} className="text-sm cursor-pointer">
                      {topic}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Which skill would you like to learn?</Label>
              <RadioGroup value={formData.selectedSkill} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedSkill: value }))}>
                {AVAILABLE_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <RadioGroupItem value={skill} id={skill} />
                    <Label htmlFor={skill} className="cursor-pointer">{skill}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>How much time can you dedicate?</Label>
              <RadioGroup value={formData.learningTime} onValueChange={(value) => setFormData(prev => ({ ...prev, learningTime: value }))}>
                {["15 minutes/day", "30 minutes/day", "1 hour/day", "2+ hours/day"].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <RadioGroupItem value={time} id={time} />
                    <Label htmlFor={time} className="cursor-pointer">{time}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1" disabled={saveOnboarding.isPending}>
              {step === 4 ? (saveOnboarding.isPending ? "Saving..." : "Start") : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
