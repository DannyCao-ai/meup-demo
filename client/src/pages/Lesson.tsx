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
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Lightbulb, Target } from "lucide-react";

type ContentItem = 
  | { type: "theory"; data: any; index: number }
  | { type: "exercise"; data: any; originalIndex: number; index: number };

export default function Lesson() {
  const { skill, lessonId } = useParams<{ skill: string; lessonId: string }>();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const keypointId = searchParams.get("keypoint");

  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [failedExercises, setFailedExercises] = useState<number[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const skillData = SKILLS.find(s => s.name === skill);
  const lesson = skillData?.lessons.find(l => l.id === lessonId);
  const keypoint = lesson?.keypoints.find(k => k.id === keypointId);

  const saveAttempt = trpc.exercise.saveAttempt.useMutation();
  const saveProgress = trpc.progress.save.useMutation();

  // Build content flow: theory card → its exercises → next theory card → its exercises...
  const contentItems: ContentItem[] = [];
  let exerciseCounter = 0;
  if (keypoint) {
    if (keypoint.theoryCards && keypoint.theoryCards.length > 0) {
      const allExercises = keypoint.exercises || [];
      const numTheoryCards = keypoint.theoryCards.length;
      const exercisesPerCard = Math.ceil(allExercises.length / numTheoryCards);
      
      keypoint.theoryCards.forEach((card, cardIdx) => {
        // Add theory card
        contentItems.push({ type: "theory", data: card, index: cardIdx });
        
        // Distribute exercises: assign exercises to this theory card
        const startIdx = cardIdx * exercisesPerCard;
        const endIdx = Math.min(startIdx + exercisesPerCard, allExercises.length);
        const cardExercises = allExercises.slice(startIdx, endIdx);
        
        // Add exercises for this theory card
        cardExercises.forEach((ex) => {
          contentItems.push({ type: "exercise", data: ex, originalIndex: exerciseCounter, index: exerciseCounter });
          exerciseCounter++;
        });
      });
    } else {
      // Fallback: no theory cards, just show exercises
      if (keypoint.exercises && keypoint.exercises.length > 0) {
        keypoint.exercises.forEach((ex, idx) => {
          contentItems.push({ type: "exercise", data: ex, originalIndex: idx, index: idx });
        });
      }
    }
  }

  const currentItem = contentItems[currentItemIdx];
  const totalTheoryCards = keypoint?.theoryCards?.length || 0;
  const totalExercises = keypoint?.exercises?.length || 0;
  const progress = totalTheoryCards > 0 
    ? ((currentItemIdx + 1) / contentItems.length) * 100
    : ((completedExercises.size) / totalExercises) * 100;

  useEffect(() => {
    if (currentItem?.type === "exercise") {
      setUserAnswer(null);
      setShowResult(false);
      setAttemptCount(0);
    }
  }, [currentItemIdx]);

  if (!keypoint || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lesson not found</p>
      </div>
    );
  }

  const checkAnswer = () => {
    if (!currentItem || currentItem.type !== "exercise") return;
    const currentExercise = currentItem.data;

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
    });

    if (correct) {
      setCompletedExercises(prev => new Set(Array.from(prev).concat(currentItem.originalIndex)));
      toast.success("Correct! Well done! 🎉");
    } else {
      if (attemptCount === 0) {
        toast.error("Not quite right. Try again!");
      } else {
        toast.error("Incorrect. Let's move on and revisit this later.");
        setFailedExercises(prev => [...prev, currentItem.originalIndex]);
      }
    }
  };

  const handleNext = () => {
    if (currentItem?.type === "theory") {
      // Move to next item
      setCurrentItemIdx(currentItemIdx + 1);
      return;
    }

    // Exercise logic
    if (!showResult) {
      toast.error("Please answer the question first");
      return;
    }

    if (isCorrect) {
      // Move to next
      if (currentItemIdx < contentItems.length - 1) {
        setCurrentItemIdx(currentItemIdx + 1);
      } else if (failedExercises.length > 0) {
        // Revisit failed exercises
        toast.info("Let's revisit the questions you missed!");
        const failedIdx = failedExercises[0];
        setFailedExercises(prev => prev.slice(1));
        setCurrentItemIdx(contentItems.findIndex(item => 
          item.type === "exercise" && item.originalIndex === failedIdx
        ));
      } else {
        // Complete
        saveProgress.mutate({
          skill: skill!,
          lessonId: lessonId!,
          keypointId: keypoint.id,
          status: "completed",
          score: (completedExercises.size / totalExercises) * 100,
          completed: true
        });
        toast.success("Keypoint completed! 🎉");
        setLocation(`/learning-path`);
      }
    } else {
      // Wrong answer
      if (attemptCount === 1) {
        // First attempt failed, try again
        setShowResult(false);
        setUserAnswer(null);
      } else {
        // Second attempt failed, move on
        if (currentItemIdx < contentItems.length - 1) {
          setCurrentItemIdx(currentItemIdx + 1);
        } else {
          // Add to failed and revisit later
          if (failedExercises.length > 0) {
            toast.info("Let's revisit the questions you missed!");
            const failedIdx = failedExercises[0];
            setFailedExercises(prev => prev.slice(1));
            setCurrentItemIdx(contentItems.findIndex(item => 
              item.type === "exercise" && item.originalIndex === failedIdx
            ));
          } else {
            saveProgress.mutate({
              skill: skill!,
              lessonId: lessonId!,
              keypointId: keypoint.id,
              status: "completed",
              score: (completedExercises.size / totalExercises) * 100,
              completed: true
            });
            toast.success("Keypoint completed!");
            setLocation(`/learning-path`);
          }
        }
      }
    }
  };

  const renderTheoryCard = (card: any) => {
    return (
      <Card className="animate-fade-in border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <Badge variant="outline" className="bg-blue-100 text-blue-800">Theory</Badge>
          </div>
          <CardTitle className="text-2xl">{card.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {card.image && (
            <img 
              src={card.image} 
              alt={card.title} 
              className="w-full rounded-lg shadow-md"
            />
          )}
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Key Principles
            </h3>
            <ul className="space-y-2">
              {card.content.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-1">•</span>
                  <span dangerouslySetInnerHTML={{ __html: point }} />
                </li>
              ))}
            </ul>
          </div>

          {card.tips && card.tips.length > 0 && (
            <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {card.tips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-600">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.example && (
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-green-600">✨</span>
                Example
              </h3>
              <p className="text-sm italic">{card.example}</p>
            </div>
          )}

          <Button onClick={handleNext} size="lg" className="w-full">
            Continue to {currentItemIdx < contentItems.length - 1 && contentItems[currentItemIdx + 1].type === "theory" ? "Next Theory" : "Practice"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderExercise = (exercise: any) => {
    switch (exercise.type) {
      case "single_choice":
        return (
          <RadioGroup 
            value={userAnswer || ""} 
            onValueChange={setUserAnswer}
          >
            {exercise.options?.map((option: string, idx: number) => (
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
            {exercise.options?.map((option: string, idx: number) => {
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
              {exercise.options?.map((option: string, idx: number) => {
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
        return <p>Exercise type not supported yet</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{keypoint.title}</h1>
              <p className="text-muted-foreground">{lesson.title}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {currentItemIdx + 1} / {contentItems.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {currentItem?.type === "theory" && renderTheoryCard(currentItem.data)}

        {currentItem?.type === "exercise" && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">Practice</Badge>
                {showResult && (
                  isCorrect ? (
                    <Badge variant="outline" className="bg-green-100 text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </Badge>
                  )
                )}
              </div>
              <CardTitle className="text-xl">{currentItem.data.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderExercise(currentItem.data)}

              {showResult && currentItem.data.explanation && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm"><strong>Explanation:</strong> {currentItem.data.explanation}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {!showResult ? (
                  <Button onClick={checkAnswer} className="flex-1" size="lg">
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="flex-1" size="lg">
                    {isCorrect ? "Next" : (attemptCount === 1 ? "Try Again" : "Continue")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

