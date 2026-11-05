// CELPIP Reading — original practice content modeled on the official task types.
// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const READING_DATA = {
  skillId: "reading",
  skillName: "Reading",
  overview: {
    format: "The Reading test has four parts and lasts about 55-60 minutes, all multiple choice.",
    parts: [
      { name: "Part 1: Reading Correspondence", desc: "Read an email or letter and fill in blanks / answer questions about it." },
      { name: "Part 2: Reading to Apply a Diagram", desc: "Read a notice, schedule, or diagram and apply the information to answer questions." },
      { name: "Part 3: Reading for Information", desc: "Read a longer informational passage and answer detail/inference questions." },
      { name: "Part 4: Reading for Viewpoints", desc: "Read an article presenting multiple viewpoints and identify who believes what." }
    ],
    tips: [
      "Skim the passage first for structure (topic, paragraph purpose), then read questions, then hunt for exact answers.",
      "Watch for paraphrasing — correct options usually reword the passage rather than copy it exactly.",
      "For viewpoint passages, make a quick mental (or scratch) note of each named person's stance as you read.",
      "Eliminate answer choices that are true in general but not actually stated in the passage — CELPIP tests what's written, not outside knowledge.",
      "Manage time: don't spend more than a few minutes per question. Flag and move on if stuck."
    ]
  },
  passages: [
    {
      id: "R1",
      partNum: 1,
      part: "Part 1: Reading Correspondence",
      title: "Email: Office Move Notice",
      text: `Subject: Upcoming Office Relocation

Hi Team,

As you may have heard, our office will be relocating to a new building on Maple Avenue starting next month. The move is scheduled for the weekend of the 14th, so the new space will be ready for us to use starting Monday the 16th.

Please pack your personal desk items into the labeled boxes provided by Friday the 12th. IT will handle disconnecting and reconnecting all computers and monitors, so you do not need to unplug anything yourself — just make sure your desk surface is clear.

Parking at the new location is more limited than here, so we're arranging a shuttle from the old building's parking lot for the first two weeks while everyone adjusts. If you plan to bike or walk instead, there's a secure bike rack at the new entrance.

If you have any large personal items (plants, extra monitors, etc.) that won't fit in a standard box, please let facilities know by Wednesday so they can arrange separate transport.

Thanks for your patience during this transition.

Best,
Facilities Team`,
      questions: [
        { q: "When will the new office be ready for use?", options: ["The 12th", "The 14th", "Monday the 16th", "The following month"], answer: 2 },
        { q: "What should employees do with their computers?", options: ["Unplug and pack them", "Leave them for IT to handle", "Bring them home", "Label them only"], answer: 1 },
        { q: "Why is a shuttle being arranged?", options: ["The new building has no elevator", "Parking is more limited at the new location", "The old building is being demolished immediately", "Public transit doesn't reach the new office"], answer: 1 },
        { q: "What should employees with oversized personal items do?", options: ["Leave them behind", "Pack them in a standard box", "Notify facilities by Wednesday", "Bring them themselves on moving weekend"], answer: 2 }
      ]
    },
    {
      id: "R2",
      partNum: 2,
      part: "Part 2: Reading to Apply a Diagram",
      title: "Community Centre Class Schedule",
      text: `Riverside Community Centre — Fall Class Schedule

Monday:
- Yoga (Beginner) — 9:00-10:00 AM — Room A — $8/session
- Pottery — 6:00-8:00 PM — Room C — $15/session (materials included)

Tuesday:
- Swimming (Kids, ages 6-10) — 4:00-4:45 PM — Pool — $10/session
- Yoga (Advanced) — 6:30-7:30 PM — Room A — $8/session

Wednesday:
- Pottery — 6:00-8:00 PM — Room C — $15/session
- Zumba — 7:00-8:00 PM — Room B — $10/session

Thursday:
- Swimming (Adults) — 6:00-6:45 PM — Pool — $12/session
- Yoga (Beginner) — 9:00-10:00 AM — Room A — $8/session

Saturday:
- Family Swim — 10:00-11:30 AM — Pool — $5/person
- Pottery (Kids) — 1:00-2:30 PM — Room C — $12/session

Notes: Room A classes require indoor shoes. Pottery classes are limited to 10 participants; register at the front desk at least one day in advance. The pool is closed for maintenance the last Saturday of each month.`,
      questions: [
        { q: "A parent wants to enroll their 8-year-old in swimming. Which session fits?", options: ["Thursday 6:00-6:45 PM", "Tuesday 4:00-4:45 PM", "Saturday 10:00-11:30 AM only", "Wednesday 7:00-8:00 PM"], answer: 1 },
        { q: "Which pottery class on the schedule has the lowest price per session?", options: ["Monday evening pottery", "Wednesday evening pottery", "Saturday kids' pottery", "All pottery classes cost the same"], answer: 2 },
        { q: "What must participants bring to Room A classes?", options: ["Their own yoga mat", "Indoor shoes", "A towel", "Nothing special"], answer: 1 },
        { q: "If someone wants to join Wednesday's pottery class, what must they do first?", options: ["Just show up", "Pay online in advance", "Register at the front desk at least one day ahead", "Bring a doctor's note"], answer: 2 },
        { q: "On which day is the pool sometimes unavailable?", options: ["Every Tuesday", "The last Saturday of the month", "Every Thursday", "The first Monday of the month"], answer: 1 }
      ]
    },
    {
      id: "R3",
      partNum: 3,
      part: "Part 3: Reading for Information",
      title: "The Rise of Urban Beekeeping",
      text: `Over the past decade, urban beekeeping has grown from a niche hobby into a widespread movement in cities across North America. Rooftop hives now sit atop hotels, office buildings, and community gardens, reflecting a broader interest in local food production and pollinator conservation.

Proponents argue that cities can actually be better environments for bees than some rural areas, since urban gardens and parks often provide a more diverse range of flowering plants throughout the growing season, and urban areas typically use fewer large-scale pesticides than intensive agricultural land. A single hive can produce anywhere from 10 to 30 kilograms of honey per year, and many urban beekeepers sell their honey locally or use it in restaurant partnerships, adding a small but meaningful revenue stream.

However, urban beekeeping is not without challenges. Hives require regular inspection and maintenance, and beginners often underestimate the time commitment — a healthy hive needs attention roughly every one to two weeks during warmer months. Cities also have varying regulations; some require beekeepers to register their hives, maintain a minimum distance from property lines, or limit the number of hives per lot. There is also an ongoing public debate about whether urban beekeeping actually helps overall bee populations or whether it mainly benefits the domesticated honeybee, a species that is not endangered, at the potential expense of wild native pollinator species, which face more habitat competition as a result.

Despite these debates, most experts agree that responsible urban beekeeping, paired with planting diverse native flowers, contributes positively to urban biodiversity when done thoughtfully.`,
      questions: [
        { q: "According to the passage, why might cities suit bees well?", options: ["Cities have warmer temperatures year-round", "Urban gardens often offer diverse flowering plants and fewer large-scale pesticides", "Cities have fewer predators for bees", "Urban beekeeping is required by law"], answer: 1 },
        { q: "How often does a hive typically need attention in warmer months?", options: ["Daily", "Roughly every one to two weeks", "Once a month", "Only at the start of the season"], answer: 1 },
        { q: "What is one criticism mentioned about urban beekeeping?", options: ["It produces no honey", "It may benefit honeybees at the expense of wild native pollinators", "It is illegal everywhere", "It requires no maintenance"], answer: 1 },
        { q: "How much honey can a single hive produce per year, according to the passage?", options: ["1-5 kilograms", "10-30 kilograms", "50-100 kilograms", "Over 200 kilograms"], answer: 1 },
        { q: "What do most experts agree on, per the final paragraph?", options: ["Urban beekeeping should be banned", "Responsible beekeeping with diverse native flowers helps urban biodiversity", "Only rural beekeeping is beneficial", "Honeybees are endangered"], answer: 1 }
      ]
    },
    {
      id: "R4",
      partNum: 4,
      part: "Part 4: Reading for Viewpoints",
      title: "Should Cities Ban Single-Use Plastic Bags?",
      text: `Local news forum — reader responses to: "Should our city ban single-use plastic bags?"

Marcus T.: Absolutely. I've seen the environmental impact firsthand — plastic bags clog storm drains and end up in waterways. A ban would push people toward reusable bags, and several cities that implemented similar bans saw litter drop noticeably within the first year. Yes, there's a small adjustment period, but the long-term benefit to wildlife and waste reduction is worth it.

Diane K.: I understand the environmental concern, but I think a ban unfairly burdens low-income families who rely on free bags for garbage disposal and don't always have the extra cash for reusable alternatives. A better solution would be a small fee on plastic bags rather than an outright ban — that changes behavior gradually without penalizing people who forget a reusable bag occasionally.

Sam O.: I run a small grocery store, and I'm caught in the middle. Reusable bag requirements sound great in theory, but paper bag alternatives are more expensive for retailers, and that cost often gets passed to customers anyway. I'd support a ban only if it came with a transition subsidy for small businesses to afford alternatives.

Priya R.: Honestly, I think the ban doesn't go far enough. We should be targeting all single-use plastics, not just bags — cutlery, straws, and packaging are just as much of a problem. A bag ban is a good first step, but treating it as the whole solution misses the bigger picture.`,
      questions: [
        { q: "What does Marcus T. believe?", options: ["Bans don't work", "A full ban would reduce litter and help wildlife", "Only a fee should be used, not a ban", "Plastic bags aren't a real problem"], answer: 1 },
        { q: "What alternative does Diane K. propose instead of a ban?", options: ["No policy change at all", "A small fee on plastic bags", "A ban on paper bags too", "Free reusable bags for everyone"], answer: 1 },
        { q: "What is Sam O.'s main concern?", options: ["Environmental impact", "The added cost to retailers and customers", "Government regulation in general", "Bag design"], answer: 1 },
        { q: "According to Priya R., what is the limitation of a bag-only ban?", options: ["It's too expensive", "It ignores other single-use plastics like cutlery and straws", "It won't reduce litter at all", "It only affects small businesses"], answer: 1 },
        { q: "Which two people focus mainly on financial/economic concerns?", options: ["Marcus T. and Priya R.", "Diane K. and Sam O.", "Marcus T. and Sam O.", "Diane K. and Priya R."], answer: 1 }
      ]
    }
  ].concat(
    typeof READING_PART1 !== "undefined" ? READING_PART1 : [],
    typeof READING_PART2 !== "undefined" ? READING_PART2 : [],
    typeof READING_PART3 !== "undefined" ? READING_PART3 : [],
    typeof READING_PART4 !== "undefined" ? READING_PART4 : []
  )
};
