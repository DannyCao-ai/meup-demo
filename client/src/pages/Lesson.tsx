import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { SKILLS } from "@shared/content";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowRight, BookOpen } from "lucide-react";

export default function Lesson() {
  const { skill, lessonId } = useParams<{ skill: string; lessonId: string }>();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const keypointId = searchParams.get("keypoint");

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [failedExercises, setFailedExercises] = useState<number[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [showTheory, setShowTheory] = useState(true);

  const skillData = SKILLS.find(s => s.name === skill);
  const lesson = skillData?.lessons.find(l => l.id === lessonId);
  const keypoint = lesson?.keypoints.find(k => k.id === keypointId);

  const saveAttempt = trpc.exercise.saveAttempt.useMutation();
  const saveProgress = trpc.progress.save.useMutation();

  const exercises = keypoint?.exercises || [];
  const currentExercise = exercises[currentExerciseIdx];
  const progress = ((completedExercises.size) / exercises.length) * 100;

  useEffect(() => {
    setUserAnswer(null);
    setShowResult(false);
    setAttemptCount(0);
  }, [currentExerciseIdx]);

  if (!keypoint || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lesson not found</p>
      </div>
    );
  }

  const checkAnswer = () => {
    if (!currentExercise) return;

    let correct = false;

    switch (currentExercise.type) {
      case "single_choice":
        correct = userAnswer === currentExercise.correctAnswer;
        break;
      case "multiple_choice":
        const correctAnswers = Array.isArray(currentExercise.correctAnswer) 
          ? currentExercise.correctAnswer 
          : [currentExercise.correctAnswer];
        correct = userAnswer && 
          userAnswer.length === correctAnswers.length &&
          userAnswer.every((a: string) => correctAnswers.includes(a));
        break;
      case "text_gap_filling":
        correct = userAnswer?.toLowerCase().trim() === 
          String(currentExercise.correctAnswer).toLowerCase().trim();
        break;
      case "arrange_sequence":
        const correctSeq = currentExercise.correctAnswer;
        correct = userAnswer && 
          JSON.stringify(userAnswer) === JSON.stringify(correctSeq);
        break;
      case "drag_drop":
      case "cues_placement":
        correct = JSON.stringify(userAnswer) === JSON.stringify(currentExercise.correctAnswer);
        break;
      case "record":
        correct = userAnswer && userAnswer.length > 20;
        break;
    }

    setIsCorrect(correct);
    setShowResult(true);
    setAttemptCount(attemptCount + 1);

    saveAttempt.mutate({
      exerciseId: currentExercise.id,
      attempt: attemptCount + 1,
      isCorrect: correct,
      userAnswer,
      needsReview: !correct && attemptCount >= 1
    });

    if (correct) {
      completedExercises.add(currentExerciseIdx);
      setCompletedExercises(new Set(completedExercises));
    } else if (attemptCount === 0) {
      toast.error("Try again!");
    } else {
      if (!failedExercises.includes(currentExerciseIdx)) {
        setFailedExercises([...failedExercises, currentExerciseIdx]);
      }
    }
  };

  const handleNext = () => {
    if (isCorrect || attemptCount >= 1) {
      if (currentExerciseIdx < exercises.length - 1) {
        setCurrentExerciseIdx(currentExerciseIdx + 1);
      } else if (failedExercises.length > 0) {
        const nextFailed = failedExercises[0];
        setFailedExercises(failedExercises.slice(1));
        setCurrentExerciseIdx(nextFailed);
        toast.info("Review this question again!");
      } else {
        saveProgress.mutate({
          skill: skill || "",
          lessonId: lessonId || "",
          keypointId: keypointId || "",
          status: "completed",
          score: (completedExercises.size / exercises.length) * 100,
          completed: true
        });
        toast.success("Keypoint completed!");
        setLocation(`/learning-path/${skill}`);
      }
    } else {
      checkAnswer();
    }
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case "single_choice":
        return (
          <RadioGroup value={userAnswer || ""} onValueChange={setUserAnswer}>
            {currentExercise.options?.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value={option} id={`opt-${idx}`} disabled={showResult} />
                <Label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {currentExercise.options?.map((option: string, idx: number) => {
              const selected = userAnswer || [];
              return (
                <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Checkbox
                    id={`opt-${idx}`}
                    checked={selected.includes(option)}
                    disabled={showResult}
                    onCheckedChange={(checked) => {
                      const newSelected = checked
                        ? [...selected, option]
                        : selected.filter((s: string) => s !== option);
                      setUserAnswer(newSelected);
                    }}
                  />
                  <label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1">
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        );

      case "text_gap_filling":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Fill in the blank:</p>
            <Input
              placeholder="Type your answer..."
              value={userAnswer || ""}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showResult}
            />
          </div>
        );

      case "arrange_sequence":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              Click to arrange in the correct order
            </p>
            <div className="grid gap-2">
              {currentExercise.options?.map((option: string, idx: number) => {
                const selected = userAnswer || [];
                const position = selected.indexOf(idx);
                return (
                  <Button
                    key={idx}
                    variant={position >= 0 ? "default" : "outline"}
                    className="justify-start"
                    disabled={showResult}
                    onClick={() => {
                      if (position >= 0) {
                        setUserAnswer(selected.filter((s: number) => s !== idx));
                      } else {
                        setUserAnswer([...selected, idx]);
                      }
                    }}
                  >
                    {position >= 0 && <span className="mr-2 font-bold">{position + 1}.</span>}
                    {option}
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case "record":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your detailed answer here..."
              value={userAnswer || ""}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showResult}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters required
            </p>
          </div>
        );

      default:
        return <p>Exercise type not implemented</p>;
    }
  };

  if (showTheory && keypoint.theory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
        <div className="container max-w-4xl mx-auto">
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">{keypoint.title}</CardTitle>
              </div>
              <CardDescription>{keypoint.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: keypoint.theory.replace(/\n/g, '<br/>') }} />
              </div>
              <Button onClick={() => setShowTheory(false)} className="w-full" size="lg">
                Start Exercises <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{keypoint.title}</h1>
              <p className="text-sm text-muted-foreground">
                Exercise {completedExercises.size + 1} of {exercises.length}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowTheory(true)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Review Theory
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentExercise?.question}</CardTitle>
              <Badge variant="outline">{currentExercise?.type.replace(/_/g, ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderExercise()}

            {showResult && (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : attemptCount === 1 ? 'Try again!' : 'Incorrect'}
                  </span>
                </div>
                {currentExercise?.explanation && (
                  <p className="text-sm text-muted-foreground">{currentExercise.explanation}</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={!userAnswer}
              >
                {showResult && (isCorrect || attemptCount >= 1) ? (
                  <>Next <ArrowRight className="ml-2 w-4 h-4" /></>
                ) : (
                  "Check Answer"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
