import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { SKILLS } from "@shared/content";
import { CheckCircle2, Circle, Lock, ArrowRight, AlertCircle, BookOpen, Info, Sparkles } from "lucide-react";

export default function LearningPath() {
  const [, setLocation] = useLocation();
  const [showRolePlay, setShowRolePlay] = useState(false);

  const { data: onboardingData } = trpc.onboarding.get.useQuery();
  const { data: progressData, isLoading } = trpc.progress.get.useQuery({
    skill: onboardingData?.selectedSkill || ""
  }, {
    enabled: !!onboardingData?.selectedSkill
  });

  const skillData = SKILLS.find(s => s.name === onboardingData?.selectedSkill);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!skillData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Skill not found</p>
      </div>
    );
  }

  const getKeypointStatus = (keypointId: string) => {
    const progress = progressData?.find(p => p.keypointId === keypointId);
    return progress?.status || "required";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "optional": return "bg-gray-100 text-gray-600 border-gray-300";
      case "recommended": return "bg-blue-100 text-blue-800 border-blue-300";
      case "required": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    switch (status) {
      case "optional": return <Info className="w-6 h-6 text-gray-500" />;
      case "recommended": return <BookOpen className="w-6 h-6 text-blue-600" />;
      case "required": return <AlertCircle className="w-6 h-6 text-orange-600" />;
      default: return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "optional": return "Optional";
      case "recommended": return "Recommended";
      case "required": return "Required";
      default: return "Not Started";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <img src="/assets/images/mascot_cat.png" alt="Mascot" className="w-16 h-16" />
            <div>
              <h1 className="text-4xl font-bold">{skillData.name}</h1>
              <p className="text-muted-foreground">Your Personalized Learning Path</p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              Required - Must Learn
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              Recommended - Practice Suggested
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
              Optional - Reference Only
            </Badge>
          </div>
        </div>

        {/* Introduction Card with Role-Play Assessment */}
        <Card className="mb-6 animate-fade-in bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img src="/assets/images/mascot_cat.png" alt="Mascot" className="w-20 h-20" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Welcome, {onboardingData?.userName}! 🎉</h2>
                <p className="text-muted-foreground mb-4">
                  I've created a personalized learning path for you based on your goals. Before we start, let's assess your current skills through an interactive role-play scenario. This will help me customize your learning journey!
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setLocation(`/roleplay/${onboardingData?.selectedSkill}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Role-Play Assessment <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {skillData.lessons.map((lesson, lessonIdx) => (
            <Card key={lesson.id} className="animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      Lesson {lessonIdx + 1}: {lesson.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{lesson.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {lesson.keypoints.map((keypoint) => {
                    const status = getKeypointStatus(keypoint.id);
                    const progress = progressData?.find(p => p.keypointId === keypoint.id);
                    const completed = progress?.completed || false;

                    return (
                      <Card 
                        key={keypoint.id} 
                        className={`border-2 transition-all hover:shadow-md cursor-pointer ${getStatusColor(status)}`}
                        onClick={() => setLocation(`/lesson/${onboardingData?.selectedSkill}/${lesson.id}?keypoint=${keypoint.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(status, completed)}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{keypoint.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {keypoint.description}
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {keypoint.exercises.length} exercises
                                </Badge>
                                {completed ? (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                  </span>
                                ) : (
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                                    {getStatusLabel(status)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scenario Branching Section */}
        <Card className="mt-8 animate-fade-in bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  Practice Scenario: Real-World Application
                  <Badge className="bg-purple-600">Interactive</Badge>
                </h2>
                <p className="text-muted-foreground mb-4">
                  Ready to test your knowledge? Navigate through a realistic workplace scenario where your choices matter. This interactive role-play will test all the keypoints you've learned and provide personalized feedback on your decision-making.
                </p>
                <div className="flex gap-3 mb-4">
                  <Badge variant="outline" className="bg-white">
                    🎭 Branching Story
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    🎯 Knowledge Testing
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    📊 Performance Analysis
                  </Badge>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => setLocation(`/scenario/${onboardingData?.selectedSkill}`)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Start Practice Scenario <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
