import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { SKILLS } from "@shared/content";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";

export default function LearningPath() {
  const { skill } = useParams<{ skill: string }>();
  const [, setLocation] = useLocation();

  const { data: progressData, isLoading } = trpc.progress.get.useQuery({
    skill: skill || ""
  });

  const skillData = SKILLS.find(s => s.name === skill);

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
    if (completed) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "optional") return <Circle className="w-5 h-5 text-gray-400" />;
    return <Circle className="w-5 h-5 text-orange-600" />;
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
                        onClick={() => setLocation(`/lesson/${skill}/${lesson.id}?keypoint=${keypoint.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(status, completed)}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{keypoint.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {keypoint.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {keypoint.exercises.length} exercises
                                </Badge>
                                {completed ? (
                                  <span className="text-xs text-green-600 font-medium">Completed</span>
                                ) : (
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
      </div>
    </div>
  );
}
