// Content structure for Active Listening and Memory topics

export const FAVORITE_TOPICS = [
  "Public Speaking",
  "Active Listening",
  "Conflict Management",
  "Presentation Skills",
  "Time Management",
  "Organizational Skills",
  "Memory",
  "Analytical Thinking",
  "Critical Thinking",
  "Problem-solving",
  "Motivation",
  "Artificial Intelligence (AI)",
  "Personal Branding",
] as const;

export const AVAILABLE_SKILLS = ["Active Listening", "Memory"] as const;

export type ExerciseType = "single_choice" | "multiple_choice" | "drag_drop" | "text_gap_filling" | "cues_placement" | "arrange_sequence" | "record";

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
}

export interface TheoryCard {
  id: string;
  title: string;
  content: string[]; // Array of bullet points/rules
  image?: string;
  tips?: string[];
  example?: string;
  exercises?: Exercise[]; // Exercises immediately following this theory card
}

export interface Keypoint {
  id: string;
  title: string;
  description?: string;
  theory: string; // Legacy full theory text
  theoryCards?: TheoryCard[]; // New: theory broken into cards
  exercises: Exercise[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  keypoints: Keypoint[];
}

export interface RolePlayQuestion {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: any;
  dimension: string; // Assessment dimension
  points: number;
}

export interface ConversationTurn {
  speaker: string;
  audioUrl: string;
  characterImage: string;
  text: string;
}

export interface RolePlay {
  id: string;
  skill: string;
  title: string;
  context: string;
  conversationTurns?: ConversationTurn[]; // New format
  groundTruth: string;
  distortedVersion?: string;
  questions: RolePlayQuestion[];
  // Legacy support
  audioUrl?: string;
  characterImage?: string;
}

// Scenario Branching Types
export interface ScenarioChoice {
  id: string;
  text: string;
  nextNodeId: string | null;
  isCorrect: boolean;
  skillsAssessed: string[];
  feedback?: string;
}

export interface ScenarioNode {
  id: string;
  type: 'situation' | 'consequence' | 'end';
  speaker?: string;
  characterImage?: string;
  audioUrl?: string;
  text: string;
  choices?: ScenarioChoice[];
}

export interface ScenarioAnalysis {
  weakKeypoints: string[];
  practiceExercises: Exercise[];
}

export interface ScenarioBranching {
  id: string;
  skill: string;
  title: string;
  description: string;
  context: string;
  startNodeId: string;
  nodes: ScenarioNode[];
  getAnalysis: (userChoices: string[]) => ScenarioAnalysis;
}

export interface ScenarioChoice {
  id: string;
  text: string;
  nextNodeId: string | null; // null means end of scenario
  isCorrect: boolean;
  skillsAssessed: string[]; // Which keypoints this choice tests
  feedback?: string;
}

export interface ScenarioNode {
  id: string;
  type: 'situation' | 'consequence' | 'end';
  speaker?: string;
  characterImage?: string;
  audioUrl?: string;
  text: string;
  choices?: ScenarioChoice[];
}

export interface ScenarioAnalysis {
  weakKeypoints: string[]; // IDs of keypoints user struggled with
  practiceExercises: Exercise[]; // Additional exercises for weak areas
}

export interface ScenarioBranching {
  id: string;
  skill: string;
  title: string;
  description: string;
  context: string;
  startNodeId: string;
  nodes: ScenarioNode[];
  getAnalysis: (userChoices: string[]) => ScenarioAnalysis;
}

// Import comprehensive content
import { ACTIVE_LISTENING_LESSONS } from './active_listening_content';
import { MEMORY_LESSONS } from './memory_content';

// Re-export for use in app
export { ACTIVE_LISTENING_LESSONS, MEMORY_LESSONS };

// Legacy content structure (will be replaced by imports above)
const LEGACY_ACTIVE_LISTENING_LESSONS: Lesson[] = [
  {
    id: "al_lesson_1",
    title: "Introduction to Active Listening",
    keypoints: [
      {
        id: "al_kp_1_1",
        title: "What is Active Listening?",
        theory: "Active listening is a communication technique that requires the listener to fully concentrate, understand, respond, and remember what is being said. It goes beyond simply hearing words—it involves engaging with the speaker through verbal and non-verbal cues to ensure complete understanding.",
        theoryCards: [
          {
            id: "al_tc_1_1_1",
            title: "What is Active Listening?",
            content: [
              "👂 **Listen** - Fully concentrate on what is being said",
              "🧠 **Understand** - Process the meaning and context",
              "💬 **Respond** - Provide appropriate feedback",
              "📝 **Remember** - Retain key information for later"
            ],
            image: "/assets/images/theory_active_listening_intro.png",
            tips: [
              "Maintain eye contact",
              "Avoid interrupting",
              "Put away distractions (phone, laptop)",
              "Show engagement through body language"
            ],
            example: "When a client explains their concerns, don't just wait for your turn to speak. Focus on their words, ask clarifying questions, and summarize to confirm understanding."
          },
          {
            id: "al_tc_1_1_2",
            title: "Hearing vs. Active Listening",
            content: [
              "🔊 **Hearing** = Passive physical process (sound waves → ears)",
              "✅ **Active Listening** = Intentional mental process (engagement + understanding)",
              "⚠️ You can hear without listening",
              "💡 Active listening requires conscious effort"
            ],
            tips: [
              "Test yourself: Can you summarize what was just said?",
              "Notice when your mind wanders - bring focus back",
              "Ask yourself: What is the speaker really trying to communicate?"
            ]
          }
        ],
        exercises: [
          {
            id: "al_ex_1_1_1",
            type: "single_choice",
            question: "What is the main difference between hearing and active listening?",
            options: [
              "Hearing requires concentration, active listening doesn't",
              "Active listening involves engagement and understanding, hearing is just perceiving sound",
              "They are essentially the same thing",
              "Hearing is more important than active listening"
            ],
            correctAnswer: "Active listening involves engagement and understanding, hearing is just perceiving sound",
            explanation: "Active listening requires full engagement and understanding, while hearing is simply the physical act of perceiving sound."
          }
        ]
      },
      {
        id: "al_kp_1_2",
        title: "Why Active Listening Matters",
        theory: "Active listening is crucial in professional and personal contexts. It builds trust, prevents misunderstandings, improves collaboration, and helps identify the real issues behind what people say. In workplace settings, poor listening can lead to costly mistakes, missed opportunities, and damaged relationships.",
        exercises: [
          {
            id: "al_ex_1_2_1",
            type: "multiple_choice",
            question: "Which of the following are benefits of active listening? (Select all that apply)",
            options: [
              "Builds trust with others",
              "Prevents misunderstandings",
              "Makes you appear smarter",
              "Improves team collaboration"
            ],
            correctAnswer: ["Builds trust with others", "Prevents misunderstandings", "Improves team collaboration"]
          }
        ]
      }
    ]
  },
  {
    id: "al_lesson_2",
    title: "Core Techniques",
    keypoints: [
      {
        id: "al_kp_2_1",
        title: "Paraphrasing",
        theory: "Paraphrasing means restating what the speaker said in your own words to confirm understanding. It shows you're paying attention and gives the speaker a chance to clarify if you misunderstood. Good paraphrasing captures the essence and emotion, not just the words.",
        exercises: [
          {
            id: "al_ex_2_1_1",
            type: "single_choice",
            question: "A colleague says: 'I'm frustrated because the project deadline keeps changing.' Which is the best paraphrase?",
            options: [
              "So you're saying the deadline changed?",
              "It sounds like the uncertainty around the timeline is causing you stress.",
              "You should talk to the manager about deadlines.",
              "Deadlines always change, that's normal."
            ],
            correctAnswer: "It sounds like the uncertainty around the timeline is causing you stress."
          }
        ]
      },
      {
        id: "al_kp_2_2",
        title: "Asking Clarifying Questions",
        theory: "Clarifying questions help you dig deeper and ensure you understand correctly. They show genuine interest and prevent assumptions. Good clarifying questions are open-ended and specific, like 'Can you tell me more about...' or 'What did you mean by...'",
        exercises: [
          {
            id: "al_ex_2_2_1",
            type: "single_choice",
            question: "Which is the best clarifying question?",
            options: [
              "Did you finish the report?",
              "Can you elaborate on what challenges you faced with the report?",
              "Why didn't you finish?",
              "Is the report done or not?"
            ],
            correctAnswer: "Can you elaborate on what challenges you faced with the report?"
          }
        ]
      },
      {
        id: "al_kp_2_3",
        title: "Summarizing",
        theory: "Summarizing involves condensing the main points of what was said into a brief statement. It's particularly useful in meetings or long conversations to ensure everyone is aligned. A good summary captures key points, priorities, and action items.",
        exercises: [
          {
            id: "al_ex_2_3_1",
            type: "single_choice",
            question: "When is summarizing most useful?",
            options: [
              "At the beginning of a conversation",
              "After a long discussion to confirm understanding and next steps",
              "Only in formal meetings",
              "When you want to interrupt someone"
            ],
            correctAnswer: "After a long discussion to confirm understanding and next steps"
          }
        ]
      }
    ]
  }
];

// Memory Content (moved to memory_content.ts)
const LEGACY_MEMORY_LESSONS: Lesson[] = [
  {
    id: "mem_lesson_1",
    title: "How Memory Works",
    keypoints: [
      {
        id: "mem_kp_1_1",
        title: "The Three Stages of Memory",
        theory: "Memory operates in three stages: Encoding (taking in information), Storage (maintaining information over time), and Retrieval (accessing stored information when needed). Understanding these stages helps you identify where memory breakdowns occur and how to strengthen each stage.",
        exercises: [
          {
            id: "mem_ex_1_1_1",
            type: "single_choice",
            question: "Which stage of memory involves taking in new information?",
            options: ["Storage", "Encoding", "Retrieval", "Consolidation"],
            correctAnswer: "Encoding"
          }
        ]
      },
      {
        id: "mem_kp_1_2",
        title: "The Forgetting Curve",
        theory: "The Forgetting Curve, discovered by Hermann Ebbinghaus, shows that we forget about 50% of new information within an hour, and up to 90% within a week without review. However, each time we review information, the curve becomes less steep, meaning we retain more for longer periods.",
        exercises: [
          {
            id: "mem_ex_1_2_1",
            type: "single_choice",
            question: "According to the Forgetting Curve, approximately how much information do we forget within a week without review?",
            options: ["30%", "50%", "70%", "90%"],
            correctAnswer: "90%"
          }
        ]
      }
    ]
  },
  {
    id: "mem_lesson_2",
    title: "Memory Techniques - Chunking",
    keypoints: [
      {
        id: "mem_kp_2_1",
        title: "What is Chunking?",
        theory: "Chunking is the process of breaking down large amounts of information into smaller, manageable groups or 'chunks'. Our working memory can typically hold 7±2 items at once. By grouping related items together, we can remember much more. For example, phone numbers are chunked: (555) 123-4567 instead of 5551234567.",
        exercises: [
          {
            id: "mem_ex_2_1_1",
            type: "single_choice",
            question: "How many items can working memory typically hold at once?",
            options: ["3-5 items", "7±2 items", "12-15 items", "Unlimited"],
            correctAnswer: "7±2 items"
          }
        ]
      },
      {
        id: "mem_kp_2_2",
        title: "Practical Chunking Applications",
        theory: "Chunking works best when you group information by meaning, category, or pattern. In business, you might chunk a presentation into 3 main sections. When learning, group related concepts together. The key is finding logical connections that make sense to you.",
        exercises: [
          {
            id: "mem_ex_2_2_1",
            type: "arrange_sequence",
            question: "Arrange these items into logical chunks: Apple, Car, Banana, Bus, Orange, Train",
            options: ["Apple", "Car", "Banana", "Bus", "Orange", "Train"],
            correctAnswer: [0, 2, 4, 1, 3, 5],
            explanation: "Fruits (Apple, Banana, Orange) and Transportation (Car, Bus, Train)"
          }
        ]
      }
    ]
  },
  {
    id: "mem_lesson_3",
    title: "Memory Palace Technique",
    keypoints: [
      {
        id: "mem_kp_3_1",
        title: "The Method of Loci",
        theory: "The Memory Palace (or Method of Loci) is an ancient technique that uses spatial memory to remember information. You visualize a familiar place (like your home) and mentally place items you want to remember in specific locations. When you need to recall, you mentally walk through the space.",
        exercises: [
          {
            id: "mem_ex_3_1_1",
            type: "single_choice",
            question: "What type of memory does the Memory Palace technique primarily leverage?",
            options: ["Auditory memory", "Spatial memory", "Muscle memory", "Emotional memory"],
            correctAnswer: "Spatial memory"
          }
        ]
      }
    ]
  }
];

// Role-play scenarios
export const ROLE_PLAYS: RolePlay[] = [
  {
    id: "rp_al_entrance",
    skill: "Active Listening",
    title: "Client Meeting Debrief",
    context: "You're a team member attending a debrief after your leader met with a client. The leader is summarizing what the client said, but you notice some key details might be missing or distorted. Listen carefully to the conversation and answer questions as they come up.",
    conversationTurns: [
      {
        speaker: "Client (Original Meeting)",
        audioUrl: "/assets/audio/conversations/al_turn0_client_original.wav",
        characterImage: "/assets/images/client_male.png",
        text: "Look, I appreciate the effort your team has put in, but I need to be clear about our expectations. The interface changes you showed us - they're just cosmetic, just different colors. That's not what we asked for. We need real UX improvements, a complete redesign of the layout and user flow. And about that regional comparison chart - this is the third time I'm bringing this up. It's not a nice-to-have, it's critical for our executives to make informed decisions. We need it in the next release. Finally, I need concrete commitments from your side: a specific demo date, a single point of contact who will handle all our communications, and I need assurance that we won't face any more delays. We can't keep going back and forth like this."
      },
      {
        speaker: "Leader",
        audioUrl: "/assets/audio/conversations/al_turn1_leader.wav",
        characterImage: "/assets/images/leader_male.png",
        text: "So I just got back from the client meeting. The client said they're happy with the progress overall. They just want us to make the interface colors a bit brighter, you know, more vibrant. Oh, and they mentioned something about a chart, but I think it's just a nice-to-have. I told them we'll have a demo ready by the end of the month, and whoever's available can handle their emails."
      },
      {
        speaker: "You (Team Member)",
        audioUrl: "/assets/audio/conversations/al_turn2_team.wav",
        characterImage: "/assets/images/team_member_female.png",
        text: "Wait, just to clarify - when you say brighter colors, did the client specifically mention they only want color changes? Or were they talking about the overall interface design and user experience?"
      },
      {
        speaker: "Leader",
        audioUrl: "/assets/audio/conversations/al_turn3_leader.wav",
        characterImage: "/assets/images/leader_male.png",
        text: "Well, they did mention the interface, but mostly about colors. They also brought up that regional comparison chart again - I think this is the third time they've asked for it. They seemed pretty insistent about it being important for their executives' decision-making."
      },
      {
        speaker: "You (Team Member)",
        audioUrl: "/assets/audio/conversations/al_turn4_team.wav",
        characterImage: "/assets/images/team_member_female.png",
        text: "Got it. And you mentioned a demo by end of month - did they ask for any other specific commitments? Like a point of contact or timeline guarantees?"
      },
      {
        speaker: "Leader",
        audioUrl: "/assets/audio/conversations/al_turn5_leader.wav",
        characterImage: "/assets/images/leader_male.png",
        text: "Oh yeah, now that you mention it - they did ask for a concrete demo date, a fixed point of contact for all communications, and they were pretty firm about not wanting any more delays. They seemed frustrated about the back-and-forth."
      }
    ],
    groundTruth: "The client emphasized three critical points: 1) The interface changes are only cosmetic (colors), not the layout/UX they expected. 2) They've requested a regional comparison chart multiple times (at least 3 times) and it's still missing. 3) They need concrete commitments: a demo date, a fixed point of contact, and assurance that delays won't happen again.",
    questions: [
      {
        id: "rp_al_q1",
        type: "record",
        question: "The leader said: 'The client just wants brighter colors.' Rephrase this to capture the client's real concern about the UI, and add a clarifying question.",
        correctAnswer: "",
        dimension: "Paraphrasing",
        points: 1
      },
      {
        id: "rp_al_q2",
        type: "multiple_choice",
        question: "Which of the following did the client emphasize about reports?",
        options: [
          "They need a regional comparison chart",
          "It's okay to delay, as long as colors are updated",
          "They already mentioned this requirement multiple times",
          "This feature is important for executives' decision making"
        ],
        correctAnswer: ["They need a regional comparison chart", "They already mentioned this requirement multiple times", "This feature is important for executives' decision making"],
        dimension: "Understanding Priority",
        points: 1
      },
      {
        id: "rp_al_q3",
        type: "multiple_choice",
        question: "The client asked for three things in the project plan. What were they?",
        options: [
          "A concrete demo date",
          "A lower project cost",
          "A fixed point of contact for responses",
          "A commitment to avoid delays",
          "More frequent color updates"
        ],
        correctAnswer: ["A concrete demo date", "A fixed point of contact for responses", "A commitment to avoid delays"],
        dimension: "Understanding Priority",
        points: 1
      },
      {
        id: "rp_al_q4",
        type: "single_choice",
        question: "Which option best summarizes the client's priorities?",
        options: [
          "They only want brighter colors and faster replies",
          "They want redesigned UI (layout/UX), a regional comparison chart, and a concrete plan with demo + POC + no more delays",
          "They want to renegotiate the contract terms",
          "They just want to see progress, details don't matter"
        ],
        correctAnswer: "They want redesigned UI (layout/UX), a regional comparison chart, and a concrete plan with demo + POC + no more delays",
        dimension: "Summarizing",
        points: 1
      },
      {
        id: "rp_al_q5",
        type: "record",
        question: "Write a short confirmation sentence (≤25 words) you would say to the leader to ensure the team correctly understands the client's three key requirements.",
        correctAnswer: "",
        dimension: "Checking for Understanding",
        points: 1
      },
      {
        id: "rp_al_q6",
        type: "single_choice",
        question: "What did the leader misinterpret when relaying the client's concerns about the UI?",
        options: [
          "That the client only cared about colors",
          "That the client wanted new icons",
          "That the client wanted fewer screens",
          "That the client wanted faster navigation"
        ],
        correctAnswer: "That the client only cared about colors",
        dimension: "Identifying Distortions",
        points: 1
      }
    ]
  },
  {
    id: "rp_mem_entrance",
    skill: "Memory",
    title: "Product Training Session",
    context: "You're a new employee attending a training session about FlowSync Pro, a new software product. Your manager will ask you to brief them afterward, so you need to remember the key features and setup process.",
    audioUrl: "/assets/audio/memory_trainer.wav",
    characterImage: "/assets/images/trainer_female.png",
    groundTruth: "FlowSync Pro has 5 core features: 1) Real-time Collaboration with live cursor tracking, 2) Smart Templates that adapt to your industry, 3) Version Control with automatic snapshots every 30 minutes, 4) Cross-platform Sync across desktop/mobile/web, 5) Advanced Analytics for productivity tracking. Setup: Install desktop app → Connect cloud storage → Invite team members. Important: Analytics only available on Business plan.",
    questions: [
      {
        id: "rp_mem_q1",
        type: "multiple_choice",
        question: "How would you best chunk the 5 features for easy recall?",
        options: [
          "By alphabetical order",
          "By technical complexity",
          "Into groups: Collaboration (Real-time, Cross-platform), Content (Templates, Version Control), Insights (Analytics)",
          "By price tier"
        ],
        correctAnswer: ["Into groups: Collaboration (Real-time, Cross-platform), Content (Templates, Version Control), Insights (Analytics)"],
        dimension: "Chunking Ability",
        points: 1
      },
      {
        id: "rp_mem_q2",
        type: "single_choice",
        question: "Which of these is NOT one of the five features?",
        options: [
          "Real-time Collaboration",
          "Automatic Backups",
          "Smart Templates",
          "Cross-platform Sync"
        ],
        correctAnswer: "Automatic Backups",
        dimension: "Detail Retention",
        points: 1
      },
      {
        id: "rp_mem_q3",
        type: "arrange_sequence",
        question: "Put the setup steps in correct order:",
        options: ["Invite team members", "Install desktop app", "Connect cloud storage"],
        correctAnswer: [1, 2, 0],
        dimension: "Sequential Memory",
        points: 1
      },
      {
        id: "rp_mem_q4",
        type: "single_choice",
        question: "How often does FlowSync Pro take automatic snapshots?",
        options: [
          "Every 15 minutes",
          "Every 30 minutes",
          "Every hour",
          "Only when you save"
        ],
        correctAnswer: "Every 30 minutes",
        dimension: "Detail Retention",
        points: 1
      },
      {
        id: "rp_mem_q5",
        type: "record",
        question: "Describe how you would use a memory palace to remember the 5 features (≤50 words)",
        correctAnswer: "",
        dimension: "Technique Application",
        points: 1
      },
      {
        id: "rp_mem_q6",
        type: "single_choice",
        question: "What important limitation did the trainer mention?",
        options: [
          "Mobile app requires separate purchase",
          "Analytics only on Business plan",
          "Maximum 10 team members",
          "No offline mode"
        ],
        correctAnswer: "Analytics only on Business plan",
        dimension: "Critical Recall",
        points: 1
      }
    ]
  },
  {
    id: "rp_scenario_branching",
    skill: "Combined",
    title: "Emergency Team Meeting",
    context: "You're in an urgent team meeting. Your colleague Alex is presenting rapidly about a critical client issue. Your manager was on another call and will ask you to brief them immediately after.",
    audioUrl: "/assets/audio/scenario_branching_alex.wav",
    characterImage: "/assets/images/alex_female.png",
    groundTruth: "Client TechCorp's system went down at 9 AM. Three critical requirements: 1) Root cause analysis by end of today, 2) Temporary workaround within 2 hours, 3) Full fix by Friday 5 PM. Issue: Payment processing module, 500 transactions stuck. CFO concerned due to month-end closing Monday. Action plan: Sarah investigates logs, Mike prepares workaround, Alex coordinates deployment. Critical warning: Do NOT restart server before capturing logs.",
    questions: [
      {
        id: "rp_sb_q1",
        type: "single_choice",
        question: "How many transactions are stuck?",
        options: ["300", "500", "700", "Alex didn't mention a number"],
        correctAnswer: "500",
        dimension: "Detail Retention",
        points: 1
      },
      {
        id: "rp_sb_q2",
        type: "single_choice",
        question: "What is the MOST urgent deadline?",
        options: [
          "Root cause analysis (today)",
          "Temporary workaround (2 hours)",
          "Full fix (Friday 5 PM)",
          "Month-end closing (Monday)"
        ],
        correctAnswer: "Temporary workaround (2 hours)",
        dimension: "Understanding Priority",
        points: 1
      },
      {
        id: "rp_sb_q3",
        type: "single_choice",
        question: "What did they specifically warn NOT to do?",
        options: [
          "Don't contact the CFO directly",
          "Don't restart the server",
          "Don't deploy without testing",
          "Don't involve external vendors"
        ],
        correctAnswer: "Don't restart the server",
        dimension: "Critical Recall",
        points: 1
      },
      {
        id: "rp_sb_q4",
        type: "record",
        question: "Summarize the situation and action plan in 3 sentences (≤50 words)",
        correctAnswer: "",
        dimension: "Summarizing",
        points: 1
      },
      {
        id: "rp_sb_q5",
        type: "single_choice",
        question: "What clarifying question would be MOST useful to ask?",
        options: [
          "What's the server's IP address?",
          "Who will communicate updates to the client?",
          "What version of the payment module are they using?",
          "Can we get overtime approved?"
        ],
        correctAnswer: "Who will communicate updates to the client?",
        dimension: "Checking for Understanding",
        points: 1
      }
    ]
  }
];

export const ASSESSMENT_DIMENSIONS = {
  "Active Listening": [
    "Paraphrasing",
    "Understanding Priority",
    "Summarizing",
    "Checking for Understanding",
    "Identifying Distortions"
  ],
  "Memory": [
    "Chunking Ability",
    "Sequential Memory",
    "Detail Retention",
    "Technique Application",
    "Critical Recall"
  ]
};


// Combined skills data for easy access
export const SKILLS = [
  {
    name: "Active Listening",
    description: "Master the art of truly hearing and understanding others",
    lessons: ACTIVE_LISTENING_LESSONS
  },
  {
    name: "Memory",
    description: "Enhance your ability to remember and recall information",
    lessons: MEMORY_LESSONS
  }
];
