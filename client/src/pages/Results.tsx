import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

export default function Results() {
  const { skill } = useParams<{ skill: string }>();
  const [, setLocation] = useLocation();

  const { data: assessment, isLoading } = trpc.assessment.getLatest.useQuery({
    skill: skill || "",
    assessmentType: "entrance"
  });

  const updateProgress = trpc.progress.updateFromAssessment.useMutation({
    onSuccess: () => {
      setLocation(`/learning-path`);
    }
  });

  useEffect(() => {
    if (assessment && assessment.scores) {
      updateProgress.mutate({
        skill: skill || "",
        scores: assessment.scores as Record<string, number>
      });
    }
  }, [assessment]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No assessment found</p>
      </div>
    );
  }

  const radarData = Object.entries(assessment.scores as Record<string, number>).map(([key, value]) => ({
    dimension: key,
    score: value,
    fullMark: 100
  }));

  const strongAreas = Object.entries(assessment.scores as Record<string, number>)
    .filter(([, score]) => score >= 80)
    .map(([dim]) => dim);

  const needsImprovement = Object.entries(assessment.scores as Record<string, number>)
    .filter(([, score]) => score < 60)
    .map(([dim]) => dim);

  const recommended = Object.entries(assessment.scores as Record<string, number>)
    .filter(([, score]) => score >= 60 && score < 80)
    .map(([dim]) => dim);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <img src="/assets/images/mascot_cat.png" alt="Mascot" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Assessment Complete!</h1>
          <p className="text-xl text-muted-foreground">
            Overall Score: <span className="text-primary font-bold">{assessment.totalScore}/100</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Your Skill Profile</CardTitle>
              <CardDescription>Radar chart showing your strengths and areas for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Your Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {strongAreas.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg">Strong Areas</CardTitle>
                  </div>
                  <CardDescription>You excel in these dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strongAreas.map((area) => (
                      <li key={area} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        <span className="text-sm">{area}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Optional review</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {recommended.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">Recommended</CardTitle>
                  </div>
                  <CardDescription>Good foundation, practice will help</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommended.map((area) => (
                      <li key={area} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <span className="text-sm">{area}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Recommended</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {needsImprovement.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-lg">Focus Areas</CardTitle>
                  </div>
                  <CardDescription>Priority learning for maximum impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {needsImprovement.map((area) => (
                      <li key={area} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                        <span className="text-sm">{area}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Required</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="text-center animate-fade-in">
          <Button 
            size="lg" 
            onClick={() => setLocation(`/learning-path/${skill}`)}
            disabled={updateProgress.isPending}
          >
            {updateProgress.isPending ? "Generating Your Path..." : "View Your Personalized Learning Path"}
          </Button>
        </div>
      </div>
    </div>
  );
}
