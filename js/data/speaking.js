// CELPIP Speaking — original practice prompts modeled on the official 8 task types.
// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const SPEAKING_DATA = {
  skillId: "speaking",
  skillName: "Speaking",
  overview: {
    format: "The Speaking test has eight tasks and lasts about 15-20 minutes. Each task gives you a short preparation time, then a longer response time, both timed by computer.",
    parts: [
      { name: "Task 1: Giving Advice", desc: "Advise a person about a situation described to you." },
      { name: "Task 2: Talking About a Personal Experience", desc: "Describe a personal experience related to a prompt." },
      { name: "Task 3: Describing a Scene", desc: "Describe an image in detail." },
      { name: "Task 4: Making Predictions", desc: "Predict what might happen next in a pictured scene." },
      { name: "Task 5: Comparing and Persuading", desc: "Compare two options and persuade someone to choose one." },
      { name: "Task 6: Dealing with a Difficult Situation", desc: "Respond diplomatically to an awkward or difficult scenario." },
      { name: "Task 7: Expressing Opinions", desc: "Give and support your opinion on a topic." },
      { name: "Task 8: Describing an Unusual Situation", desc: "Describe an unusual or surprising image in detail." }
    ],
    tips: [
      "Use every second of prep time to jot 2-3 key points — don't try to script word-for-word.",
      "Speak for the full response time; running out of things to say hurts your score more than minor grammar slips.",
      "Use linking language (first, also, on top of that, in the end) to sound organized.",
      "For opinion/persuasion tasks, pick a clear side immediately — hedging wastes time and weakens the response.",
      "Record yourself and listen back for filler words (um, like) and pacing."
    ]
  },
  prompts: [
    { id: "S1", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
      prompt: "Your friend has been offered two jobs: one with higher pay but a long commute, and one with lower pay but five minutes from home. Your friend calls you for advice. Give your friend advice about which job to take and why." },
    { id: "S2", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
      prompt: "Describe a time when you had to learn a new skill quickly. What was the skill, why did you need to learn it, and how did you go about learning it?" },
    { id: "S3", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
      prompt: "Imagine a photo of a busy farmers' market: vendors selling vegetables, fruit, and flowers, people carrying baskets, a musician playing guitar in the corner, and children running near a fountain. Describe this scene in as much detail as possible." },
    { id: "S4", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
      prompt: "Imagine a picture showing dark storm clouds gathering over a beach where several families are having a picnic, with some people already packing up their belongings. Predict what will happen next in this scene." },
    { id: "S5", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
      prompt: "Your team can choose between hosting the office holiday party at a restaurant or at the office with catering. Compare the two options and persuade your coworker to agree with your choice." },
    { id: "S6", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
      prompt: "You borrowed your coworker's laptop charger and accidentally damaged it. Your coworker needs it for an important presentation tomorrow morning. Explain the situation to your coworker and propose a solution." },
    { id: "S7", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
      prompt: "Some people believe that schools should eliminate homework entirely, while others believe homework is essential for learning. What is your opinion? Support it with reasons and examples." },
    { id: "S8", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
      prompt: "Imagine a picture of a man in a business suit riding a unicycle through an office hallway while coworkers stare in surprise, with papers flying off a nearby desk. Describe this unusual scene in as much detail as possible." }
  ].concat(typeof SPEAKING_POOL !== "undefined" ? SPEAKING_POOL : [])
};
