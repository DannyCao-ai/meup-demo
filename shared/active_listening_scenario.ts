import { ScenarioBranching, ScenarioNode, ScenarioAnalysis, Exercise } from "./content";

// Active Listening Scenario: "The Frustrated Team Member"
export const ACTIVE_LISTENING_SCENARIO: ScenarioBranching = {
  id: "al_scenario_1",
  skill: "Active Listening",
  title: "The Frustrated Team Member",
  description: "Navigate a challenging conversation with a frustrated colleague. Your choices will determine the outcome.",
  context: "You're a project manager. Your team member, Alex, has requested an urgent meeting. They seem visibly stressed.",
  startNodeId: "node_1",
  
  nodes: [
    // Opening situation
    {
      id: "node_1",
      type: "situation",
      speaker: "Alex",
      characterImage: "/assets/images/alex_frustrated.png",
      audioUrl: "/assets/audio/scenario_al_1_1.mp3",
      text: "Thanks for meeting with me. I'm really struggling with this project. The requirements keep changing, and I feel like nobody is listening to my concerns. I've been working overtime, but it feels pointless.",
      choices: [
        {
          id: "choice_1_a",
          text: "I understand you're frustrated. Can you tell me more about which requirements have been changing?",
          nextNodeId: "node_2a",
          isCorrect: true,
          skillsAssessed: ["al_kp_1_1", "al_kp_2_1"], // Four Pillars, Paraphrasing
          feedback: "Good! You're showing empathy and asking for specifics - key active listening skills."
        },
        {
          id: "choice_1_b",
          text: "Everyone is working overtime. That's just how projects work sometimes.",
          nextNodeId: "node_2b",
          isCorrect: false,
          skillsAssessed: ["al_kp_1_1"], // Four Pillars
          feedback: "This dismisses Alex's feelings and doesn't show active listening. Try to understand their perspective first."
        },
        {
          id: "choice_1_c",
          text: "*Check your phone while Alex is talking*",
          nextNodeId: "node_2c",
          isCorrect: false,
          skillsAssessed: ["al_kp_1_1"], // Four Pillars - Listening Barriers
          feedback: "External distractions prevent active listening. Give Alex your full attention."
        }
      ]
    },

    // Path A: Good listening - Alex opens up
    {
      id: "node_2a",
      type: "consequence",
      speaker: "Alex",
      characterImage: "/assets/images/alex_talking.png",
      audioUrl: "/assets/audio/scenario_al_1_2a.mp3",
      text: "Well, last week the client wanted feature X, but yesterday they said they want feature Y instead. I spent 20 hours on X, and now it feels wasted. Plus, when I mentioned this in the team meeting, everyone just moved on to the next topic.",
      choices: [
        {
          id: "choice_2a_1",
          text: "So if I'm understanding correctly, you're concerned about two things: changing requirements and feeling unheard in meetings. Is that right?",
          nextNodeId: "node_3a",
          isCorrect: true,
          skillsAssessed: ["al_kp_2_1"], // Paraphrasing
          feedback: "Excellent paraphrasing! You're confirming understanding before moving forward."
        },
        {
          id: "choice_2a_2",
          text: "That's frustrating, but we need to be flexible with client requests.",
          nextNodeId: "node_3b",
          isCorrect: false,
          skillsAssessed: ["al_kp_1_1"], // Listening Mindset
          feedback: "You're jumping to solutions without fully understanding. Try paraphrasing first."
        }
      ]
    },

    // Path B: Dismissive - Alex becomes defensive
    {
      id: "node_2b",
      type: "consequence",
      speaker: "Alex",
      characterImage: "/assets/images/alex_defensive.png",
      audioUrl: "/assets/audio/scenario_al_1_2b.mp3",
      text: "*Crosses arms* You know what, never mind. I'll just figure it out myself.",
      choices: [
        {
          id: "choice_2b_1",
          text: "Wait, I'm sorry. I didn't mean to dismiss your concerns. Can we start over? I want to understand what's happening.",
          nextNodeId: "node_3c",
          isCorrect: true,
          skillsAssessed: ["al_kp_1_1"], // Listening Mindset - Recovery
          feedback: "Good recovery! Acknowledging your mistake and refocusing on listening."
        },
        {
          id: "choice_2b_2",
          text: "Okay, let me know if you need anything.",
          nextNodeId: "node_end_bad",
          isCorrect: false,
          skillsAssessed: ["al_kp_1_2"], // Why Active Listening Matters
          feedback: "The conversation ends poorly. Alex feels unheard and the problem remains unresolved."
        }
      ]
    },

    // Path C: Distracted - Alex notices and shuts down
    {
      id: "node_2c",
      type: "consequence",
      speaker: "Alex",
      characterImage: "/assets/images/alex_disappointed.png",
      audioUrl: "/assets/audio/scenario_al_1_2c.mp3",
      text: "*Pauses, looks disappointed* You know what, you seem busy. I'll email you the details instead.",
      choices: [
        {
          id: "choice_2c_1",
          text: "*Put phone away* I apologize, Alex. You have my full attention now. This is important. Please continue.",
          nextNodeId: "node_3c",
          isCorrect: true,
          skillsAssessed: ["al_kp_1_1"], // Listening Barriers - Recovery
          feedback: "Good! You recognized the barrier and removed it. Now rebuild trust."
        },
        {
          id: "choice_2c_2",
          text: "Okay, send me an email.",
          nextNodeId: "node_end_bad",
          isCorrect: false,
          skillsAssessed: ["al_kp_1_2"], // Cost of Poor Listening
          feedback: "You missed an opportunity to connect. Email won't capture the emotional context."
        }
      ]
    },

    // Path A continued: Deep understanding
    {
      id: "node_3a",
      type: "consequence",
      speaker: "Alex",
      characterImage: "/assets/images/alex_relieved.png",
      audioUrl: "/assets/audio/scenario_al_1_3a.mp3",
      text: "*Nods* Yes, exactly! Thank you for understanding. I just want to make sure my work matters and that the team values my input.",
      choices: [
        {
          id: "choice_3a_1",
          text: "Your work absolutely matters. Let's discuss how we can handle requirement changes better and ensure your voice is heard in meetings. What would help?",
          nextNodeId: "node_end_best",
          isCorrect: true,
          skillsAssessed: ["al_kp_2_2"], // Asking Questions
          feedback: "Perfect! You validated their feelings and moved to collaborative problem-solving."
        },
        {
          id: "choice_3a_2",
          text: "I'll talk to the client about the requirements.",
          nextNodeId: "node_end_good",
          isCorrect: false,
          skillsAssessed: ["al_kp_2_2"], // Asking Questions
          feedback: "You're taking action, but didn't involve Alex in the solution. Better to collaborate."
        }
      ]
    },

    // Path B/C: Trying to recover
    {
      id: "node_3b",
      type: "consequence",
      speaker: "Alex",
      characterImage: "/assets/images/alex_neutral.png",
      audioUrl: "/assets/audio/scenario_al_1_3b.mp3",
      text: "*Sighs* I know we need to be flexible, but it would help if we had a process for handling changes.",
      choices: [
        {
          id: "choice_3b_1",
          text: "That's a great point. What kind of process would work for you?",
          nextNodeId: "node_end_good",
          isCorrect: true,
          skillsAssessed: ["al_kp_2_2"], // Asking Questions
          feedback: "You're asking for their input, which shows respect and engagement."
        }
      ]
    },

    // Recovery path
    {
      id: "node_3c",
      type: "consequence",
      speaker: "Alex",
      characterImage: "/assets/images/alex_cautious.png",
      audioUrl: "/assets/audio/scenario_al_1_3c.mp3",
      text: "*Hesitates* Okay... Well, the main issue is that requirements keep changing without any discussion with the team.",
      choices: [
        {
          id: "choice_3c_1",
          text: "I hear you. Can you give me a specific example so I can better understand the impact?",
          nextNodeId: "node_end_good",
          isCorrect: true,
          skillsAssessed: ["al_kp_2_2"], // Asking Questions
          feedback: "You're rebuilding trust by asking for details and showing genuine interest."
        }
      ]
    },

    // Endings
    {
      id: "node_end_best",
      type: "end",
      speaker: "Narrator",
      text: "**Excellent outcome!** Alex feels heard and valued. Together, you create a change management process and establish better communication in meetings. Team morale improves, and Alex becomes more engaged. Your active listening prevented a potential resignation and strengthened the team."
    },
    {
      id: "node_end_good",
      type: "end",
      speaker: "Narrator",
      text: "**Good outcome.** Alex feels somewhat heard. You take some action, but the conversation could have been more collaborative. The immediate issue is addressed, but deeper concerns remain. With better active listening, you could have built stronger trust."
    },
    {
      id: "node_end_bad",
      type: "end",
      speaker: "Narrator",
      text: "**Poor outcome.** Alex leaves feeling unheard and undervalued. They become disengaged from the project and start looking for other opportunities. The underlying issues remain unresolved, affecting team morale. This demonstrates the cost of poor listening."
    }
  ],

  getAnalysis: (userChoices: string[]) => {
    const weakKeypoints: string[] = [];
    const practiceExercises: Exercise[] = [];

    // Analyze which skills user struggled with
    const incorrectChoices = userChoices.filter(choiceId => {
      const allChoices = ACTIVE_LISTENING_SCENARIO.nodes
        .flatMap(node => node.choices || []);
      const choice = allChoices.find(c => c.id === choiceId);
      return choice && !choice.isCorrect;
    });

    const skillsNeedingWork = new Set<string>();
    incorrectChoices.forEach(choiceId => {
      const allChoices = ACTIVE_LISTENING_SCENARIO.nodes
        .flatMap(node => node.choices || []);
      const choice = allChoices.find(c => c.id === choiceId);
      if (choice) {
        choice.skillsAssessed.forEach(skill => skillsNeedingWork.add(skill));
      }
    });

    // Map to keypoint IDs and generate exercises
    if (skillsNeedingWork.has("al_kp_1_1")) {
      weakKeypoints.push("al_kp_1_1");
      practiceExercises.push({
        id: "practice_1_1",
        type: "single_choice",
        question: "During a conversation, you notice your mind wandering. What should you do?",
        options: [
          "Continue listening and hope you catch up",
          "Acknowledge it internally and refocus on the speaker",
          "Interrupt and ask them to repeat",
          "Check your phone to wake yourself up"
        ],
        correctAnswer: "Acknowledge it internally and refocus on the speaker",
        explanation: "Active listening requires conscious effort. When you notice your mind wandering, acknowledge it and intentionally refocus on the speaker."
      });
    }

    if (skillsNeedingWork.has("al_kp_2_1")) {
      weakKeypoints.push("al_kp_2_1");
      practiceExercises.push({
        id: "practice_2_1",
        type: "single_choice",
        question: "Your colleague says: 'I'm overwhelmed with the workload and the deadline seems impossible.' What's the best paraphrase?",
        options: [
          "So you're stressed about work.",
          "You're concerned about both the amount of work and the timeline. Is that right?",
          "Everyone is busy right now.",
          "You need to manage your time better."
        ],
        correctAnswer: "You're concerned about both the amount of work and the timeline. Is that right?",
        explanation: "Good paraphrasing captures the key points (workload + deadline) and confirms understanding by asking for validation."
      });
    }

    if (skillsNeedingWork.has("al_kp_2_2")) {
      weakKeypoints.push("al_kp_2_2");
      practiceExercises.push({
        id: "practice_2_2",
        type: "multiple_choice",
        question: "Which of these are good follow-up questions? (Select all that apply)",
        options: [
          "Can you tell me more about that?",
          "Why did you do it that way?",
          "What would help in this situation?",
          "Don't you think you're overreacting?"
        ],
        correctAnswer: ["Can you tell me more about that?", "What would help in this situation?"],
        explanation: "Open-ended, non-judgmental questions encourage dialogue. 'Why' questions can sound accusatory, and dismissive questions shut down conversation."
      });
    }

    if (skillsNeedingWork.has("al_kp_1_2")) {
      weakKeypoints.push("al_kp_1_2");
      practiceExercises.push({
        id: "practice_1_2",
        type: "single_choice",
        question: "What is a key benefit of active listening in the workplace?",
        options: [
          "It makes meetings shorter",
          "It builds trust and prevents misunderstandings",
          "It allows you to multitask",
          "It means you don't have to take notes"
        ],
        correctAnswer: "It builds trust and prevents misunderstandings",
        explanation: "Active listening builds trust by showing people they're valued, and prevents costly errors from miscommunication."
      });
    }

    return {
      weakKeypoints: Array.from(weakKeypoints),
      practiceExercises
    };
  }
};

