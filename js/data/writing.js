// CELPIP Writing — original practice prompts modeled on the official task types.
// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const WRITING_DATA = {
  skillId: "writing",
  skillName: "Writing",
  overview: {
    format: "The Writing test has two tasks and lasts about 53-60 minutes total.",
    parts: [
      { name: "Task 1: Writing an Email", desc: "Respond to a situation by writing an email (about 27 minutes, 150-200 words recommended)." },
      { name: "Task 2: Responding to Survey Questions", desc: "Give and justify your opinion on a survey question (about 26 minutes, 150-200 words recommended)." }
    ],
    tips: [
      "Address every bullet point in the prompt — missing a required element caps your score even if the writing is excellent.",
      "Use a clear structure: greeting/intro, body paragraph(s) with reasons or details, closing/sign-off.",
      "Match tone to the situation — formal for a manager/company, informal for a friend.",
      "Aim for 150-200 words; too short under-develops ideas, too long risks losing time and coherence.",
      "Leave 2-3 minutes to proofread for grammar, spelling, and whether you answered the full prompt."
    ],
    rubricCriteria: [
      "Content/Task Fulfillment — did you address every required point?",
      "Vocabulary — range and precision of word choice",
      "Readability — organization, flow, transitions",
      "Task-specific grammar — sentence variety and accuracy"
    ]
  },
  prompts: [
    {
      id: "W1",
      task: "Task 1: Writing an Email",
      taskType: "email",
      title: "Complaint About a Noisy Neighbour",
      timeLimitMin: 27,
      wordTarget: [150, 200],
      prompt: "You live in an apartment building. Your upstairs neighbour has been playing loud music late at night for the past two weeks, and it's affecting your sleep. Write an email to your building manager. In your email:\n\n- Explain the situation\n- Describe how it has affected you\n- Suggest what you would like the manager to do",
      checklist: [
        "Explained the noise problem clearly (what, when, how often)",
        "Described the personal impact (e.g., lost sleep, work performance)",
        "Made a specific, reasonable request of the manager",
        "Used an appropriately formal tone",
        "Included a greeting and sign-off"
      ]
    },
    {
      id: "W2",
      task: "Task 1: Writing an Email",
      taskType: "email",
      title: "Requesting a Schedule Change",
      timeLimitMin: 27,
      wordTarget: [150, 200],
      prompt: "You work part-time at a retail store. You have a family event next month and need to request specific days off. Write an email to your manager. In your email:\n\n- Explain why you need the time off\n- Specify the exact dates\n- Offer a solution for covering your shifts",
      checklist: [
        "Clearly stated the reason for the request",
        "Gave specific dates",
        "Proposed a solution for shift coverage (e.g., swap, find a replacement)",
        "Polite, professional tone",
        "Clear greeting and closing"
      ]
    },
    {
      id: "W3",
      task: "Task 2: Survey Response",
      taskType: "survey",
      title: "Company Fitness Benefit Survey",
      timeLimitMin: 26,
      wordTarget: [150, 200],
      prompt: "Your company is deciding between two employee wellness benefits: (A) a subsidized gym membership, or (B) an on-site fitness room. Which option do you think the company should choose? Give reasons to support your opinion.",
      checklist: [
        "Clearly stated a single opinion (A or B)",
        "Gave at least two supporting reasons",
        "Used specific examples or details, not just general statements",
        "Acknowledged or briefly addressed the alternative",
        "Concluded with a clear restatement of the opinion"
      ]
    },
    {
      id: "W4",
      task: "Task 2: Survey Response",
      taskType: "survey",
      title: "Online vs. In-Person Learning",
      timeLimitMin: 26,
      wordTarget: [150, 200],
      prompt: "A local college is deciding whether to offer more of its courses online or keep most courses in-person. Which do you think is better for students: online courses or in-person courses? Give reasons to support your opinion.",
      checklist: [
        "Clearly stated a single opinion",
        "Gave at least two supporting reasons",
        "Used specific examples (e.g., flexibility, interaction, cost)",
        "Addressed a counterpoint briefly",
        "Concluded with a clear final statement"
      ]
    }
  ].concat(typeof WRITING_POOL !== "undefined" ? WRITING_POOL : [])
};
