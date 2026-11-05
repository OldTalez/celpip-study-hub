// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const WRITING_POOL = [
  {
    id: "W-E-01",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Reporting a Malfunctioning Workstation",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You work in a busy customer service call centre. For the past week, your headset has been cutting out during calls, and you have not been able to reach customers properly. Write an email to your IT support supervisor. In your email:\n\n- Describe the technical problem\n- Explain how it is affecting your work\n- Request a specific solution or timeline for a fix",
    checklist: [
      "Described the headset malfunction with specific details (what happens, how often)",
      "Explained the impact on your ability to serve customers or meet targets",
      "Requested a specific solution (repair, replacement) with a reasonable timeline",
      "Maintained a professional, solution-focused tone",
      "Included an appropriate greeting and sign-off"
    ]
  },
  {
    id: "W-E-02",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Requesting Urgent Heating Repairs",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "The heating system in your rented apartment has not been working properly for the past four days, and outdoor temperatures are dropping below freezing. Write an email to your landlord. In your email:\n\n- Explain the problem with the heating system\n- Describe how it is affecting you and your household\n- Request that repairs be made by a specific date",
    checklist: [
      "Clearly described the heating problem and how long it has lasted",
      "Explained the impact on health or comfort (e.g., cold temperatures, young children)",
      "Requested repairs by a specific, reasonable date",
      "Used a firm but respectful and formal tone",
      "Included a greeting and proper sign-off"
    ]
  },
  {
    id: "W-E-03",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Requesting a Refund for a Defective Appliance",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You purchased a blender online three weeks ago, and it stopped working after only two uses despite being used exactly as instructed. Write an email to the store's customer service department. In your email:\n\n- Describe the product and the problem\n- Explain the inconvenience this has caused\n- Request a specific resolution (refund, replacement, or repair)",
    checklist: [
      "Identified the product and purchase details clearly",
      "Described the defect specifically (what stopped working, when)",
      "Explained the inconvenience caused",
      "Requested one clear, specific resolution",
      "Used a polite but firm customer-service tone"
    ]
  },
  {
    id: "W-E-04",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Requesting a Meeting About Your Child's Progress",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "Your child's teacher sent home a report card showing a sudden drop in grades, along with a note that your child has seemed withdrawn in class. Write an email to your child's teacher. In your email:\n\n- Explain what you have noticed at home\n- Ask about what the teacher has observed at school\n- Request a meeting to discuss the situation",
    checklist: [
      "Shared specific observations about the child's behaviour at home",
      "Asked a clear question about the teacher's observations at school",
      "Requested a meeting with a suggested time frame",
      "Tone conveyed genuine concern without sounding accusatory",
      "Included a greeting and sign-off appropriate for a teacher"
    ]
  },
  {
    id: "W-E-05",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Addressing a Shared Driveway Problem",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You share a driveway with your neighbour, and for the past two weeks their visitors have been parking in a way that blocks your access to your garage. Write an email to your neighbour. In your email:\n\n- Explain the parking problem\n- Describe how it has inconvenienced you\n- Suggest a solution you could both agree on",
    checklist: [
      "Described the parking issue with specific details",
      "Explained the inconvenience (e.g., being late for work, blocked access)",
      "Proposed a reasonable, specific solution",
      "Kept a friendly, non-confrontational tone appropriate for a neighbour",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-06",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Cancelling a Membership Due to Relocation",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You are relocating to another city for work next month and need to cancel your annual gym membership early. Write an email to the gym's membership office. In your email:\n\n- Explain your reason for cancelling\n- Provide relevant details (membership ID, move date)\n- Ask about the cancellation process and any applicable refund",
    checklist: [
      "Clearly explained the reason for cancelling (relocation)",
      "Included relevant account or membership details and the move date",
      "Asked a specific question about the cancellation process or refund policy",
      "Polite, professional tone throughout",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-07",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Coordinating a Colleague's Farewell Party",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "A well-liked coworker is retiring next month, and you have volunteered to help organize a small office farewell gathering. Write an email to your teammates. In your email:\n\n- Explain the purpose and proposed date of the event\n- Ask for input on food or activities\n- Request that everyone confirm attendance by a specific date",
    checklist: [
      "Stated the purpose and a proposed date for the gathering",
      "Asked teammates for input on at least one aspect (food, activities, etc.)",
      "Requested attendance confirmation with a clear deadline",
      "Warm but organized, professional tone",
      "Included a greeting and sign-off suitable for colleagues"
    ]
  },
  {
    id: "W-E-08",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Disputing a Vacation Day Balance",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "According to your pay portal, you have fewer vacation days remaining than you believe you should have, based on the days you have already used. Write an email to your HR department. In your email:\n\n- Explain the discrepancy you noticed\n- Provide details that support your calculation\n- Request that they review and correct your balance",
    checklist: [
      "Clearly explained the discrepancy in the vacation day balance",
      "Provided specific supporting details (dates taken, expected total)",
      "Requested a specific action (review and correction)",
      "Professional, factual tone without sounding accusatory",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-09",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Requesting an Exchange for a Faulty Laptop",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You bought a laptop two weeks ago, and the screen has started flickering randomly, even after a factory reset. Write an email to the retailer's customer support team. In your email:\n\n- Describe the issue with the laptop\n- Explain steps you have already taken to try to fix it\n- Request an exchange for a new unit",
    checklist: [
      "Described the technical problem with specific details",
      "Mentioned troubleshooting steps already attempted",
      "Requested a specific resolution (exchange)",
      "Clear, polite, and assertive customer-service tone",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-10",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Requesting a Letter of Reference",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You are applying for a new job and would like to list your former manager as a reference. Write an email to your former manager. In your email:\n\n- Explain the position you are applying for\n- Remind them briefly of your work together\n- Ask if they would be willing to provide a reference",
    checklist: [
      "Explained the position or company being applied to",
      "Briefly reminded the manager of shared work history or achievements",
      "Politely asked if they would be willing to act as a reference",
      "Respectful, appreciative tone throughout",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-11",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Rescheduling a Medical Appointment",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You have a dental appointment scheduled for next Tuesday, but a mandatory training session at work now conflicts with it. Write an email to the dental clinic's front desk. In your email:\n\n- Explain why you need to reschedule\n- Suggest two or three alternative times that work for you\n- Ask them to confirm the new appointment",
    checklist: [
      "Explained the reason for rescheduling",
      "Offered specific alternative times or dates",
      "Asked for confirmation of the new appointment",
      "Polite, concise tone appropriate for a service provider",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-12",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Disputing an Unexpected Bank Fee",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You noticed an unfamiliar $45 fee on your latest bank statement that you do not recognize and believe was charged in error. Write an email to your bank's customer service department. In your email:\n\n- Describe the charge in question\n- Explain why you believe it is incorrect\n- Request that they investigate and respond by a certain date",
    checklist: [
      "Identified the specific charge (amount, approximate date)",
      "Explained clearly why the charge seems incorrect",
      "Requested an investigation with a reasonable response deadline",
      "Formal, factual tone appropriate for a financial institution",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-13",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Proposing Flexible Work Hours",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "You believe your team's productivity would improve if employees could choose their own start times within a set range. Write an email to your manager. In your email:\n\n- Explain your proposed idea\n- Give reasons why it would benefit the team\n- Suggest how it could be implemented on a trial basis",
    checklist: [
      "Clearly explained the proposed flexible-hours idea",
      "Gave at least two specific benefits to the team or company",
      "Suggested a practical way to trial or implement the idea",
      "Confident but respectful, professional tone",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-14",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Giving Feedback on an Event Catering Service",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "Your company recently used a catering company for an office event. The food was good, but delivery was over an hour late and several items on the order were missing. Write an email to the catering company. In your email:\n\n- Summarize your overall experience\n- Point out the specific problems that occurred\n- Suggest what they could do differently for future events",
    checklist: [
      "Gave a balanced summary of the overall experience",
      "Identified specific problems (late delivery, missing items)",
      "Offered a constructive suggestion for improvement",
      "Professional, constructive tone rather than purely negative",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-E-15",
    task: "Task 1: Writing an Email",
    taskType: "email",
    title: "Reporting a Safety Hazard on Your Street",
    timeLimitMin: 27,
    wordTarget: [150, 200],
    prompt: "A streetlight on your residential block has been out for over three weeks, and several neighbours have mentioned feeling unsafe walking after dark. Write an email to your city's public works department. In your email:\n\n- Describe the problem and its exact location\n- Explain the safety concern it is causing\n- Request that it be repaired as soon as possible",
    checklist: [
      "Described the problem with a precise location",
      "Explained the specific safety concern for residents",
      "Made a clear, direct request for repair",
      "Formal, civic-minded tone appropriate for a government office",
      "Included a greeting and sign-off"
    ]
  },
  {
    id: "W-S-01",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Employee Commuting Benefit Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company is deciding between two commuting benefits for employees: (A) a subsidized public transit pass, or (B) free on-site parking. Which option do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to cost, environment, or convenience",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-02",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "City Transportation Investment Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your city council is deciding how to spend its transportation budget: (A) building more protected cycling lanes, or (B) adding more frequent bus routes. Which option do you think the city should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to safety, cost, or accessibility",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-03",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Workplace Flexibility Policy Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company is considering two ways to improve work-life balance: (A) switching to a four-day workweek, or (B) allowing employees to work from home permanently. Which option do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to productivity, cost, or family life",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-04",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "New Community Facility Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your city has funding for one new public facility: (A) a larger public library with study and meeting spaces, or (B) a new community sports complex. Which option do you think the city should build? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to community needs or age groups served",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-05",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "University Curriculum Focus Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "A local university is reviewing its programs and deciding whether to focus more on (A) practical, hands-on job training, or (B) broad theoretical and academic knowledge. Which approach do you think is more valuable for students? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to career readiness or long-term learning",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-06",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Plastic Bag Policy Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your city is considering two ways to reduce plastic bag use: (A) banning plastic bags in all stores, or (B) charging a small fee for each plastic bag used. Which approach do you think the city should adopt? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to environmental impact or convenience",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-07",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Annual Conference Format Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company is deciding how to hold its annual conference this year: (A) fully in-person at a hotel venue, or (B) fully virtual through video conferencing. Which format do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to cost, networking, or accessibility",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-08",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Housing Location Trade-Off Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "A newcomer to Canada is deciding between two housing options: (A) renting a smaller apartment close to work with a short commute, or (B) buying a larger home farther away with a long daily commute. Which option do you think is generally better? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to cost, time, or quality of life",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-09",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Employee Health Benefit Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company is deciding between two health benefits: (A) opening an on-site health clinic for quick appointments, or (B) subsidizing employees' health insurance premiums. Which option do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to convenience, cost, or coverage",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-10",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Workplace Communication Method Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company is deciding on its main communication tool: (A) switching to instant messaging for most day-to-day communication, or (B) continuing to rely primarily on email. Which option do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to speed, clarity, or record-keeping",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-11",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Office Layout Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company is redesigning its office space and deciding between (A) an open-plan layout with shared desks, or (B) private cubicles for each employee. Which layout do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to collaboration, focus, or noise",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-12",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Municipal Spending Priority Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your city has additional funding to invest in one area: (A) expanding and improving public parks, or (B) expanding public transit routes and frequency. Which option do you think the city should prioritize? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to health, environment, or daily commuting",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-13",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "School Calendar Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "A local school board is deciding how to increase instructional time: (A) extending the length of the school day, or (B) shortening the summer break. Which approach do you think is better? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to student learning, fatigue, or family schedules",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-14",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Workplace Technology Investment Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your company has a budget to improve efficiency and is deciding between (A) investing in new AI automation software, or (B) investing in additional staff training and development. Which option do you think the company should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to cost, skill development, or long-term efficiency",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  },
  {
    id: "W-S-15",
    task: "Task 2: Survey Response",
    taskType: "survey",
    title: "Office Sustainability Practice Survey",
    timeLimitMin: 26,
    wordTarget: [150, 200],
    prompt: "Your office is deciding how to reduce waste in the kitchen area: (A) switching to reusable dishware and cutlery, or (B) switching to compostable disposable dishware. Which option do you think the office should choose? Give reasons to support your opinion.",
    checklist: [
      "Clearly stated a single opinion (A or B)",
      "Gave at least two supporting reasons",
      "Used specific examples related to cost, cleaning effort, or environmental impact",
      "Acknowledged or briefly addressed the alternative",
      "Concluded with a clear restatement of the opinion"
    ]
  }
];

const SPEAKING_POOL = [
  { id: "S1-01", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your friend has two job offers: a permanent full-time position with lower pay and full benefits, or a one-year contract role with higher pay but no benefits and no guarantee of renewal. Your friend calls you for advice. Give your friend advice about which job to take and why." },
  { id: "S1-02", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your coworker is trying to decide whether to buy a newer used car with a bit more debt, or keep repairing an older car that keeps breaking down. Your coworker asks for your advice. Give your coworker advice about which option to choose and why." },
  { id: "S1-03", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your friend is choosing between two apartments: a smaller unit close to work with higher rent, or a larger unit farther away with lower rent but a 45-minute commute. Your friend asks for your advice. Give your friend advice about which apartment to choose and why." },
  { id: "S1-04", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your colleague has been offered a promotion that would require relocating to another city within six months, away from family and friends. Your colleague is not sure whether to accept it and asks for your advice. Give your colleague advice about whether to accept the promotion and why." },
  { id: "S1-05", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your friend wants to improve their English quickly and is deciding between an evening class twice a week for several months, or an intensive weekend course over just a few weeks. Your friend asks for your advice. Give your friend advice about which option to choose and why." },
  { id: "S1-06", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your cousin is considering leaving a stable job in accounting to pursue a new career in a field they are passionate about but have little experience in. Your cousin asks for your advice. Give your cousin advice about what to do and why." },
  { id: "S1-07", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your friend, who works long hours, is deciding whether to adopt a rescue dog that needs a lot of attention, or a rescue cat that is more independent. Your friend asks for your advice. Give your friend advice about which pet to adopt and why." },
  { id: "S1-08", taskNum: 1, task: "Task 1: Giving Advice", prepSec: 30, responseSec: 90,
    prompt: "Your neighbour's laptop is old and slow, and they are deciding whether to buy a new one now at full price, or wait a month for a big sale and risk their current laptop failing before then. Your neighbour asks for your advice. Give your neighbour advice about what to do and why." },

  { id: "S2-01", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when you had to adapt to a major change in your life, such as moving to a new place or starting a new job. What was the change, and how did you adjust to it?" },
  { id: "S2-02", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when you helped a coworker, classmate, or friend solve a problem. What was the problem, and how did you help?" },
  { id: "S2-03", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a memorable trip or outing you have taken. Where did you go, and what made it memorable?" },
  { id: "S2-04", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when you had to make an important decision that affected your future. What was the decision, and how did you make up your mind?" },
  { id: "S2-05", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when you faced a difficult challenge at work or school and had to find a way to overcome it. What happened, and how did you handle it?" },
  { id: "S2-06", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when someone gave you helpful feedback or advice that changed how you did something. What was the advice, and how did you use it?" },
  { id: "S2-07", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when you worked with a group of people to complete a task or project. What was your role, and how did the group work together?" },
  { id: "S2-08", taskNum: 2, task: "Task 2: Talking About a Personal Experience", prepSec: 30, responseSec: 60,
    prompt: "Describe a time when you tried something for the first time and the experience turned out differently than you expected. What happened?" },

  { id: "S3-01", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a busy airport departure lounge: travellers checking flight boards, a family with young children sitting near the gate, a businessman on a video call, and an airline staff member helping someone with a boarding pass. Describe this scene in as much detail as possible." },
  { id: "S3-02", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a city park on a warm weekend afternoon: a group having a picnic on a blanket, a man jogging along a path, two children on a see-saw, and an older couple sitting on a bench feeding pigeons. Describe this scene in as much detail as possible." },
  { id: "S3-03", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a food court in a shopping mall: people lining up at different food counters, a group of teenagers sharing a table, a worker wiping down tables, and a toddler in a stroller reaching for a napkin. Describe this scene in as much detail as possible." },
  { id: "S3-04", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a train station platform during rush hour: commuters checking their phones while waiting, a conductor announcing a delay, someone rushing with a rolling suitcase, and a street musician playing near the entrance. Describe this scene in as much detail as possible." },
  { id: "S3-05", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a community outdoor swimming pool on a hot day: children splashing in the shallow end, a lifeguard watching from a raised chair, a group of adults doing water aerobics, and a family setting up towels on lounge chairs. Describe this scene in as much detail as possible." },
  { id: "S3-06", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a downtown street festival: food vendors under colourful tents, a band performing on a small stage, children getting their faces painted, and a crowd gathered around a street performer. Describe this scene in as much detail as possible." },
  { id: "S3-07", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a university campus quad between classes: students walking in different directions with backpacks, a group sitting on the grass studying, someone handing out flyers for a club, and a professor chatting with a student near a bench. Describe this scene in as much detail as possible." },
  { id: "S3-08", taskNum: 3, task: "Task 3: Describing a Scene", prepSec: 30, responseSec: 90,
    prompt: "Imagine a photo of a hotel lobby during a busy conference: attendees checking in at a long front desk, a group networking near a coffee station, someone reviewing notes on a couch, and a bellhop wheeling a cart of luggage. Describe this scene in as much detail as possible." },

  { id: "S4-01", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a cyclist speeding toward a busy intersection just as a delivery van begins pulling out of a driveway without checking the bike lane. Predict what will happen next in this scene." },
  { id: "S4-02", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing dark clouds gathering over an outdoor wedding reception, with the tables set but no tablecloths or decorations covered yet, and guests starting to glance up at the sky. Predict what will happen next in this scene." },
  { id: "S4-03", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a toddler reaching up toward a glass vase balanced near the edge of a shelf, while a parent stands a few steps away, focused on folding laundry. Predict what will happen next in this scene." },
  { id: "S4-04", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a waiter carrying a full tray of drinks through a crowded restaurant, walking toward a table where a young child's foot is sticking out into the aisle. Predict what will happen next in this scene." },
  { id: "S4-05", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a pot of soup boiling vigorously and starting to bubble over on a stove, while the cook stands in the next room, deeply focused on a phone call. Predict what will happen next in this scene." },
  { id: "S4-06", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a group of hikers on a mountain trail as thunder rumbles in the distance, with a shelter sign pointing toward a hut still far ahead. Predict what will happen next in this scene." },
  { id: "S4-07", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a stack of heavy boxes teetering on the edge of a high shelf directly above a busy office walkway, while employees pass underneath without noticing. Predict what will happen next in this scene." },
  { id: "S4-08", taskNum: 4, task: "Task 4: Making Predictions", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture showing a dog that has slipped out of its leash, standing at the edge of a sidewalk and staring intently at a squirrel on the other side of a busy street. Predict what will happen next in this scene." },

  { id: "S5-01", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a friend are planning a birthday celebration and can choose between a bowling alley or an escape room. Compare the two options and persuade your friend to agree with your choice." },
  { id: "S5-02", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and your coworkers are choosing a farewell gift for a retiring colleague: a group gift card, or a personalized photo album with messages from the team. Compare the two options and persuade your coworker to agree with your choice." },
  { id: "S5-03", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a family member are planning a vacation and can choose between a quiet mountain cabin or a busy beach resort. Compare the two options and persuade your family member to agree with your choice." },
  { id: "S5-04", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a teammate are choosing project management software for your team: a free tool with basic features, or a paid tool with advanced features. Compare the two options and persuade your teammate to agree with your choice." },
  { id: "S5-05", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a friend are organizing transportation for a group outing and can choose between renting a van or taking public transit. Compare the two options and persuade your friend to agree with your choice." },
  { id: "S5-06", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a coworker are choosing a caterer for an upcoming office event: a local family-run restaurant, or a large professional catering company. Compare the two options and persuade your coworker to agree with your choice." },
  { id: "S5-07", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a friend are planning a weekend activity and can choose between a hiking trip or a museum visit. Compare the two options and persuade your friend to agree with your choice." },
  { id: "S5-08", taskNum: 5, task: "Task 5: Comparing and Persuading", prepSec: 60, responseSec: 60,
    prompt: "You and a classmate are deciding where to hold your study group sessions: at your home, or at the public library. Compare the two options and persuade your classmate to agree with your choice." },

  { id: "S6-01", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You forgot to submit a report your coworker Maria needed for an important client meeting this afternoon. Explain the situation to Maria and propose a solution." },
  { id: "S6-02", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You accidentally deleted a shared file that your teammate David had been working on all week. Explain the situation to David and propose a solution." },
  { id: "S6-03", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You arrived late to a presentation your friend Sam was counting on you to help deliver, missing your part of the talk. Explain the situation to Sam and propose a solution." },
  { id: "S6-04", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You promised to babysit for your neighbour Lisa this evening, but an urgent work emergency has come up at the last minute. Explain the situation to Lisa and propose a solution." },
  { id: "S6-05", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You accidentally spilled coffee on your colleague Ahmed's laptop just before an important meeting. Explain the situation to Ahmed and propose a solution." },
  { id: "S6-06", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You borrowed money from your friend Priya several weeks ago and forgot to pay her back by the date you had agreed on. Explain the situation to Priya and propose a solution." },
  { id: "S6-07", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You mistakenly booked the wrong date for the venue at your coworker Tom's farewell event, which he is counting on you to organize correctly. Explain the situation to Tom and propose a solution." },
  { id: "S6-08", taskNum: 6, task: "Task 6: Dealing with a Difficult Situation", prepSec: 30, responseSec: 60,
    prompt: "You accidentally sent your friend Jenna a private message that was meant for someone else, and it contained sensitive information about a mutual friend. Explain the situation to Jenna and propose a solution." },

  { id: "S7-01", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe employers should require employees to work in the office full-time, while others believe remote work should be a permanent option. What is your opinion? Support it with reasons and examples." },
  { id: "S7-02", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe social media companies should be responsible for monitoring and removing harmful content on their platforms, while others believe this should not be their responsibility. What is your opinion? Support it with reasons and examples." },
  { id: "S7-03", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe schools should focus more on teaching practical life skills, while others believe traditional academic subjects should remain the priority. What is your opinion? Support it with reasons and examples." },
  { id: "S7-04", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe governments should provide free public transportation to reduce traffic and pollution, while others believe this would be too costly and inefficient. What is your opinion? Support it with reasons and examples." },
  { id: "S7-05", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe a country should focus on developing new technology, while others believe it should focus on preserving traditional industries and skills. What is your opinion? Support it with reasons and examples." },
  { id: "S7-06", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe companies should be allowed to monitor employees' productivity using software, while others believe this is an invasion of privacy. What is your opinion? Support it with reasons and examples." },
  { id: "S7-07", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe competition drives success in the workplace, while others believe cooperation is more important. What is your opinion? Support it with reasons and examples." },
  { id: "S7-08", taskNum: 7, task: "Task 7: Expressing Opinions", prepSec: 30, responseSec: 90,
    prompt: "Some people believe university education should be free for all students, while others believe students should continue to pay tuition. What is your opinion? Support it with reasons and examples." },

  { id: "S8-01", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a grocery store where a group of shoppers are having a silent disco between the aisles, all wearing headphones and dancing while pushing their carts. Describe this unusual scene in as much detail as possible." },
  { id: "S8-02", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a city bus where one passenger is calmly holding the leash of a full-grown ostrich standing in the aisle, while other passengers stare in disbelief. Describe this unusual scene in as much detail as possible." },
  { id: "S8-03", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of an office meeting room where every employee is dressed in a full winter snowsuit and boots, despite sitting indoors at a normal conference table. Describe this unusual scene in as much detail as possible." },
  { id: "S8-04", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a quiet library where a man has set up a small barbecue grill at his study table and is cooking sausages while other patrons read nearby. Describe this unusual scene in as much detail as possible." },
  { id: "S8-05", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a wedding where the groom is arriving on a horse painted with black and white zebra stripes, while guests take photos in astonishment. Describe this unusual scene in as much detail as possible." },
  { id: "S8-06", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a dentist's waiting room where a patient is performing an energetic drum solo on the furniture and magazines while everyone else waits calmly. Describe this unusual scene in as much detail as possible." },
  { id: "S8-07", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a subway car where a violinist and several commuters have spontaneously formed a small orchestra, playing together as the train moves between stations. Describe this unusual scene in as much detail as possible." },
  { id: "S8-08", taskNum: 8, task: "Task 8: Describing an Unusual Situation", prepSec: 30, responseSec: 60,
    prompt: "Imagine a picture of a rooftop where a group of businesspeople in formal suits are holding a meeting while sitting inside a bubbling hot tub, laptops balanced on floating trays. Describe this unusual scene in as much detail as possible." }
];
