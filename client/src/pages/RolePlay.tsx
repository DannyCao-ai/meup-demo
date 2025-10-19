import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ROLE_PLAYS } from "@shared/content";
import { toast } from "sonner";
import { PlayCircle, PauseCircle, Volume2, ArrowRight } from "lucide-react";
import AudioRecorder from "@/components/AudioRecorder";

export default function RolePlay() {
  const { skill } = useParams<{ skill: string }>();
  const [, setLocation] = useLocation();
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedCurrentTurn, setHasPlayedCurrentTurn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<Record<string, any>>({});
  const [showQuestion, setShowQuestion] = useState(false);

  const analyzeVoice = trpc.voice.transcribeAndAnalyze.useMutation({
    onSuccess: (data, variables) => {
      setVoiceAnalysis(prev => ({ ...prev, [variables.question]: data }));
      setIsAnalyzing(false);
      toast.success("Voice analysis complete!");
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error("Failed to analyze voice");
    }
  });

  const rolePlay = ROLE_PLAYS.find(rp => rp.skill === skill);

  const submitAssessment = trpc.assessment.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Assessment completed!");
      setLocation(`/results/${skill}`);
    },
    onError: () => {
      toast.error("Failed to submit assessment");
    }
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setHasPlayedCurrentTurn(true);
      });
    }
  }, [currentTurnIndex]);

  if (!rolePlay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Role-play not found</p>
      </div>
    );
  }

  const hasConversationTurns = rolePlay.conversationTurns && rolePlay.conversationTurns.length > 0;
  
  // Question mapping for conversation format
  // Turn 0 (Leader) → no question yet
  // Turn 1 (You) → no question yet  
  // Turn 2 (Leader) → Q1, Q2 (after this turn)
  // Turn 3 (You) → no question yet
  // Turn 4 (Leader) → Q3, Q4, Q5 (after this turn)
  const questionAfterTurn: Record<number, number[]> = {
    2: [0, 1], // After turn 2 (3rd turn), ask Q1 and Q2
    4: [2, 3, 4] // After turn 4 (5th turn), ask Q3, Q4, Q5
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        setHasPlayedCurrentTurn(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTurn = () => {
    if (!hasPlayedCurrentTurn && hasConversationTurns) {
      toast.error("Please listen to the audio first");
      return;
    }

    // Check if there are questions after this turn
    const questionsToAsk = questionAfterTurn[currentTurnIndex];
    if (questionsToAsk && questionsToAsk.length > 0) {
      setShowQuestion(true);
      setCurrentQuestionIndex(questionsToAsk[0]);
    } else if (hasConversationTurns && rolePlay.conversationTurns && currentTurnIndex < rolePlay.conversationTurns.length - 1) {
      setCurrentTurnIndex(currentTurnIndex + 1);
      setHasPlayedCurrentTurn(false);
      setShowQuestion(false);
    } else {
      // All turns done, move to questions if any remaining
      if (currentQuestionIndex < rolePlay.questions.length - 1) {
        setShowQuestion(true);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Submit assessment
        submitAssessment.mutate({
          skill: skill || "",
          assessmentType: "entrance",
          answers
        });
      }
    }
  };

  const currentQ = rolePlay.questions[currentQuestionIndex];
  const currentTurn = hasConversationTurns && rolePlay.conversationTurns ? rolePlay.conversationTurns[currentTurnIndex] : null;
  
  const totalSteps = hasConversationTurns && rolePlay.conversationTurns
    ? rolePlay.conversationTurns.length + rolePlay.questions.length
    : rolePlay.questions.length;
  const currentStep = hasConversationTurns 
    ? (showQuestion ? currentTurnIndex + currentQuestionIndex + 1 : currentTurnIndex + 1)
    : currentQuestionIndex + 1;
  const progress = (currentStep / totalSteps) * 100;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNextQuestion = () => {
    // For record type, check if voice analysis is complete
    if (currentQ.type === "record" && !voiceAnalysis[currentQ.question]) {
      toast.error("Please record and analyze your answer first");
      return;
    }
    
    // For other types, check if answer exists
    if (currentQ.type !== "record" && !answers[currentQ.id]) {
      toast.error("Please answer the question");
      return;
    }
    
    // Store voice analysis as answer for record type
    if (currentQ.type === "record" && voiceAnalysis[currentQ.question]) {
      setAnswers(prev => ({ ...prev, [currentQ.id]: voiceAnalysis[currentQ.question].transcript }));
    }

    // Check if there are more questions after current turn
    const questionsToAsk = questionAfterTurn[currentTurnIndex];
    const currentQuestionIndexInTurn = questionsToAsk?.indexOf(currentQuestionIndex) ?? -1;
    
    if (questionsToAsk && currentQuestionIndexInTurn < questionsToAsk.length - 1) {
      // More questions for this turn
      setCurrentQuestionIndex(questionsToAsk[currentQuestionIndexInTurn + 1]);
    } else if (hasConversationTurns && rolePlay.conversationTurns && currentTurnIndex < rolePlay.conversationTurns.length - 1) {
      // Move to next turn
      setCurrentTurnIndex(currentTurnIndex + 1);
      setHasPlayedCurrentTurn(false);
      setShowQuestion(false);
    } else if (currentQuestionIndex < rolePlay.questions.length - 1) {
      // More questions remaining
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All done, submit
      submitAssessment.mutate({
        skill: skill || "",
        assessmentType: "entrance",
        answers
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <img src="/assets/images/mascot_cat.png" alt="Mascot" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold">{rolePlay.title}</h1>
              <p className="text-muted-foreground">{rolePlay.skill} Assessment</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {showQuestion ? `Question ${currentQuestionIndex + 1}` : `Conversation Turn ${currentTurnIndex + 1}`} of {totalSteps} steps
          </p>
        </div>

        {!showQuestion && hasConversationTurns && currentTurn && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>{rolePlay.context}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <img 
                  src={currentTurn.characterImage} 
                  alt={currentTurn.speaker} 
                  className="w-24 h-24 rounded-lg object-cover shadow-md"
                />
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-2">{currentTurn.speaker}</p>
                  <p className="text-sm text-gray-700 mb-3 italic">"{currentTurn.text}"</p>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handlePlayPause}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      {isPlaying ? "Pause" : "Play Audio"}
                    </Button>
                    {hasPlayedCurrentTurn && (
                      <span className="text-xs text-green-600">✓ Played</span>
                    )}
                  </div>
                </div>
              </div>
              <audio ref={audioRef} src={currentTurn.audioUrl} />
              
              <div className="text-center pt-4">
                <Button onClick={handleNextTurn} size="lg" className="gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showQuestion && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">{currentQ.question}</CardTitle>
              <CardDescription>
                Testing: {currentQ.dimension} ({currentQ.points} point{currentQ.points > 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQ.type === "single_choice" && currentQ.options && (
                <RadioGroup 
                  value={answers[currentQ.id] || ""} 
                  onValueChange={handleAnswer}
                >
                  {currentQ.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                      <RadioGroupItem value={option} id={`${currentQ.id}-${idx}`} />
                      <Label htmlFor={`${currentQ.id}-${idx}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQ.type === "multiple_choice" && currentQ.options && (
                <div className="space-y-2">
                  {currentQ.options.map((option, idx) => {
                    const selected = answers[currentQ.id] || [];
                    return (
                      <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Checkbox
                          id={`${currentQ.id}-${idx}`}
                          checked={selected.includes(option)}
                          onCheckedChange={(checked) => {
                            const newSelected = checked
                              ? [...selected, option]
                              : selected.filter((s: string) => s !== option);
                            handleAnswer(newSelected);
                          }}
                        />
                        <label htmlFor={`${currentQ.id}-${idx}`} className="cursor-pointer flex-1">
                          {option}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "record" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    🎤 Record your spoken answer. AI will transcribe and analyze your response.
                  </p>
                  <AudioRecorder
                    disabled={isAnalyzing}
                    onRecordingComplete={async (audioBlob) => {
                      setIsAnalyzing(true);
                      const reader = new FileReader();
                      reader.readAsDataURL(audioBlob);
                      reader.onloadend = () => {
                        const base64 = reader.result?.toString().split(',')[1] || '';
                        analyzeVoice.mutate({
                          audioBase64: base64,
                          question: currentQ.question,
                          context: rolePlay.context,
                          groundTruth: rolePlay.groundTruth
                        });
                      };
                    }}
                  />
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      Analyzing your response...
                    </div>
                  )}
                  {voiceAnalysis[currentQ.question] && (
                    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
                      <CardContent className="pt-6 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">📝 Transcript:</p>
                          <p className="text-sm text-gray-600 italic">"{voiceAnalysis[currentQ.question].transcript}"</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">🎯 Score: {voiceAnalysis[currentQ.question].score}/100</p>
                          <p className="text-sm text-gray-600">{voiceAnalysis[currentQ.question].feedback}</p>
                        </div>
                        {voiceAnalysis[currentQ.question].strengths?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-green-700 mb-1">✅ Strengths:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {voiceAnalysis[currentQ.question].strengths.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {voiceAnalysis[currentQ.question].improvements?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-orange-700 mb-1">💡 Areas for Improvement:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {voiceAnalysis[currentQ.question].improvements.map((i: string, idx: number) => (
                                <li key={idx}>{i}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleNextQuestion}
                  className="flex-1"
                  size="lg"
                >
                  {currentQuestionIndex < rolePlay.questions.length - 1 ? "Next Question" : "Complete Assessment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

