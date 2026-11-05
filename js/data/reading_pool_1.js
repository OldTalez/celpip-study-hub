// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const READING_PART1 = [
  {
    "id": "R1-01",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Notice: Scheduled Water Shutoff for Pipe Repairs",
    "text": "Subject: Scheduled Water Shutoff — Pipe Repairs at Cedarbrook Apartments\n\nDear Residents,\n\nBuilding management has scheduled essential plumbing repairs for the main water line serving units 100 through 220. The work will take place on Thursday, September 3rd, and water service will be shut off from 8:00 AM until approximately 4:00 PM. If the repairs take longer than expected, we will send an update by 2:00 PM that day.\n\nPlease fill several large containers with water the night before for drinking, cooking, and flushing toilets during the shutoff. We also recommend running your dishwasher and washing machine before 7:30 AM on the 3rd, since both appliances require water pressure to function.\n\nThe repair crew, Bramwell Plumbing Services, will access the basement mechanical room through the parking garage entrance. Residents do not need to be home, but if you have pets that use the courtyard, please arrange an alternate walking route, as the courtyard gate will be blocked by equipment from 7:30 AM to 5:00 PM.\n\nUnits 221 through 340 are on a separate line and will not be affected, though water pressure may be slightly reduced during the repair window.\n\nIf you have a medical condition requiring a continuous water supply, please contact the building office at least 48 hours in advance so we can arrange bottled water delivery to your unit.\n\nWe apologize for the inconvenience and appreciate your patience.\n\nBuilding Management\nCedarbrook Apartments",
    "questions": [
      {
        "q": "What is the main reason for the scheduled water shutoff?",
        "options": [
          "To install new water meters",
          "To repair the main water line serving units 100-220",
          "To clean the building's water tank",
          "To respond to a resident complaint about water quality"
        ],
        "answer": 1
      },
      {
        "q": "Which units are affected by the shutoff described in the notice?",
        "options": [
          "All units in the building",
          "Units 221 through 340",
          "Units 100 through 220",
          "Only ground-floor units"
        ],
        "answer": 2
      },
      {
        "q": "On what date will the shutoff take place?",
        "options": [
          "September 3rd",
          "September 8th",
          "August 30th",
          "October 3rd"
        ],
        "answer": 0
      },
      {
        "q": "If the repair work runs longer than planned, when will management send an update?",
        "options": [
          "By 5:00 PM",
          "The next morning",
          "By 2:00 PM",
          "They will not send an update"
        ],
        "answer": 2
      },
      {
        "q": "What are residents advised to do the night before the shutoff?",
        "options": [
          "Call the building office",
          "Fill several large containers with water",
          "Leave their unit for the day",
          "Turn off their own water valves"
        ],
        "answer": 1
      },
      {
        "q": "Why should residents run laundry or dishwasher loads before 7:30 AM on the day of the shutoff?",
        "options": [
          "Because electricity will also be off",
          "Because those appliances need water pressure to work",
          "Because the laundry room will be locked",
          "Because of noise restrictions"
        ],
        "answer": 1
      },
      {
        "q": "Who has been hired to carry out the plumbing repairs?",
        "options": [
          "Cedarbrook's in-house maintenance team",
          "Bramwell Plumbing Services",
          "A city utility crew",
          "Thornton Contractors"
        ],
        "answer": 1
      },
      {
        "q": "How will the repair crew reach the basement mechanical room?",
        "options": [
          "Through the main lobby",
          "Through the parking garage entrance",
          "Through each affected unit",
          "Through the courtyard gate"
        ],
        "answer": 1
      },
      {
        "q": "What restriction applies to the courtyard during the repair window?",
        "options": [
          "It will be permanently closed",
          "It will be blocked by equipment from 7:30 AM to 5:00 PM",
          "Pets will be banned from the building",
          "It will be open only to unit 100-220 residents"
        ],
        "answer": 1
      },
      {
        "q": "What is true about units 221 through 340?",
        "options": [
          "They will have no water at all",
          "They are on a separate line and unaffected, though pressure may drop slightly",
          "They must be evacuated",
          "They will get bottled water automatically"
        ],
        "answer": 1
      },
      {
        "q": "What should a resident with a medical condition requiring continuous water do?",
        "options": [
          "Move to a hotel for the day",
          "Nothing, the shutoff won't affect them",
          "Contact the building office at least 48 hours in advance",
          "Call Bramwell Plumbing directly"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "R1-02",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Email: Enhanced Employee Benefits Package",
    "text": "Subject: Introducing Our Enhanced Benefits Package for 2027\n\nDear Staff,\n\nStarting January 1st, 2027, Halden Manufacturing will roll out an enhanced employee benefits package following feedback from last spring's staff survey. The updated plan increases the annual dental coverage maximum from $1,500 to $2,000 per employee and adds coverage for orthodontic treatment for dependents under age 19.\n\nA new addition is the Wellness Spending Account, which provides each full-time employee with $500 per year to put toward gym memberships, fitness equipment, or registered massage therapy. Part-time employees who work at least 20 hours per week will receive a prorated amount of $250. Receipts must be submitted through the HR portal within 90 days of purchase to be reimbursed.\n\nVision coverage will also expand to include a $150 allowance for prescription safety glasses for employees in warehouse or production roles, available every two years instead of annually claiming regular glasses.\n\nTo enroll or make changes to your existing plan, please complete the online benefits form by December 5th. Employees who do not submit a form will automatically be moved to the new plan's default tier at no cost increase.\n\nAn information session will be held in the main conference room on November 18th at 1:00 PM for anyone with questions; a recording will be posted to the intranet for staff who cannot attend in person.\n\nWe're excited to offer this expanded support for your health and wellbeing.\n\nHuman Resources\nHalden Manufacturing",
    "questions": [
      {
        "q": "When does the enhanced benefits package take effect?",
        "options": [
          "Immediately upon reading the email",
          "January 1st, 2027",
          "At the start of the next fiscal quarter",
          "December 5th"
        ],
        "answer": 1
      },
      {
        "q": "What prompted the update to the benefits package?",
        "options": [
          "A change in government regulations",
          "Feedback from last spring's staff survey",
          "A merger with another company",
          "Rising insurance premiums alone"
        ],
        "answer": 1
      },
      {
        "q": "How much is the new annual dental coverage maximum?",
        "options": [
          "$1,500",
          "$1,800",
          "$2,000",
          "$2,500"
        ],
        "answer": 2
      },
      {
        "q": "What new dental benefit is being added for dependents?",
        "options": [
          "Free annual cleanings",
          "Orthodontic treatment coverage for dependents under 19",
          "Unlimited dental visits",
          "Coverage for cosmetic whitening"
        ],
        "answer": 1
      },
      {
        "q": "How much does the Wellness Spending Account provide full-time employees per year?",
        "options": [
          "$250",
          "$500",
          "$1,000",
          "$150"
        ],
        "answer": 1
      },
      {
        "q": "What amount do part-time employees working at least 20 hours per week receive?",
        "options": [
          "The same $500 as full-time employees",
          "Nothing, they are not eligible",
          "$250, prorated",
          "$500 but only for gym memberships"
        ],
        "answer": 2
      },
      {
        "q": "Within how many days must receipts be submitted for Wellness Spending Account reimbursement?",
        "options": [
          "30 days",
          "60 days",
          "90 days",
          "120 days"
        ],
        "answer": 2
      },
      {
        "q": "Which employees are eligible for the new $150 safety glasses allowance?",
        "options": [
          "All employees equally, every year",
          "Warehouse or production employees, every two years",
          "Only management staff",
          "Employees over age 50"
        ],
        "answer": 1
      },
      {
        "q": "What is the deadline to submit the online benefits enrollment form?",
        "options": [
          "November 18th",
          "December 5th",
          "January 1st",
          "December 31st"
        ],
        "answer": 1
      },
      {
        "q": "What happens to employees who don't submit an enrollment form by the deadline?",
        "options": [
          "They lose all benefits",
          "They are automatically moved to the new plan's default tier at no extra cost",
          "They must pay a late fee",
          "Their old plan is extended for one more year"
        ],
        "answer": 1
      },
      {
        "q": "What will be available for employees who can't attend the November 18th information session?",
        "options": [
          "A private one-on-one meeting",
          "A recording posted to the intranet",
          "A rescheduled session in December",
          "A printed transcript mailed to their home"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-03",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Email: Resolution for a Delayed Furniture Order",
    "text": "Subject: Re: Delayed Order #48213 — Resolution\n\nDear Ms. Alvarez,\n\nThank you for reaching out about your order of a Winslow 3-seat sofa, placed on July 2nd, which was originally scheduled to arrive by July 20th. I've looked into your file and confirmed that the delay was caused by a shortage of the oatmeal-coloured fabric you selected, which our supplier did not restock until August 1st.\n\nI sincerely apologize for the lack of communication — you should have received an automatic delay notice within five business days of the original ship date, and that clearly did not happen due to a system error on our end.\n\nYour sofa is now in production and is expected to ship by August 12th, arriving within 7-10 business days after that. As an apology for the delay and the communication failure, we are refunding 20% of your purchase price, which comes to $178.00, back to your original payment method within 5-7 business days.\n\nAdditionally, we're upgrading your delivery to include free white-glove setup, normally a $75 fee, so our team will assemble the sofa and remove all packaging on delivery day.\n\nIf the sofa has not shipped by August 15th, please contact me directly at extension 204, and we will explore expediting your order or offering a full refund with no restocking fee, at your preference.\n\nThank you again for your patience, and I apologize for the inconvenience.\n\nSincerely,\nOwen Park\nCustomer Care Team, Brightleaf Home Furnishings",
    "questions": [
      {
        "q": "What item did Ms. Alvarez order?",
        "options": [
          "A dining table",
          "A Winslow 3-seat sofa",
          "A bedroom set",
          "An armchair"
        ],
        "answer": 1
      },
      {
        "q": "When was the order originally supposed to arrive?",
        "options": [
          "July 2nd",
          "July 20th",
          "August 1st",
          "August 12th"
        ],
        "answer": 1
      },
      {
        "q": "What caused the delay in the order?",
        "options": [
          "A shipping strike",
          "A shortage of the selected fabric colour",
          "A pricing error",
          "Damage during manufacturing"
        ],
        "answer": 1
      },
      {
        "q": "What should have happened within five business days of the original ship date, according to the email?",
        "options": [
          "A full refund",
          "An automatic delay notice",
          "A phone call from the CEO",
          "Free shipping upgrade"
        ],
        "answer": 1
      },
      {
        "q": "Why didn't the customer receive that automatic notice?",
        "options": [
          "She opted out of emails",
          "A system error on the company's end",
          "The notice was sent to the wrong address",
          "There is no such notice policy"
        ],
        "answer": 1
      },
      {
        "q": "When is the sofa now expected to ship?",
        "options": [
          "July 20th",
          "August 1st",
          "August 12th",
          "August 15th"
        ],
        "answer": 2
      },
      {
        "q": "How much is the customer being refunded, and what percentage does it represent?",
        "options": [
          "10%, $89",
          "20%, $178",
          "30%, $267",
          "50%, $445"
        ],
        "answer": 1
      },
      {
        "q": "How long will the refund take to process?",
        "options": [
          "1-2 business days",
          "5-7 business days",
          "2 weeks",
          "It has already been processed"
        ],
        "answer": 1
      },
      {
        "q": "What free upgrade is the customer receiving?",
        "options": [
          "Express shipping",
          "White-glove delivery setup, normally $75",
          "A discount on her next purchase",
          "Extended warranty"
        ],
        "answer": 1
      },
      {
        "q": "What should the customer do if the sofa hasn't shipped by August 15th?",
        "options": [
          "Wait another month",
          "Contact Owen Park at extension 204",
          "Cancel the order automatically",
          "Reorder a different colour"
        ],
        "answer": 1
      },
      {
        "q": "What options does the customer have if the order still hasn't shipped by August 15th?",
        "options": [
          "Only a partial refund",
          "Expedited shipping or a full refund with no restocking fee",
          "Store credit only",
          "None, she must wait"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-04",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Email: Grade 5 Field Trip Permission Notice",
    "text": "Subject: Permission Required: Grade 5 Field Trip to Pinehollow Nature Centre\n\nDear Parents and Guardians,\n\nRoom 14 and Room 16 students will be taking a field trip to the Pinehollow Nature Centre on Friday, October 9th, as part of our unit on local ecosystems. Students will participate in a guided forest walk, a pond study activity, and a short presentation on wetland conservation.\n\nThe class will leave Elmwood Public School by bus at 8:45 AM and return by 3:15 PM, in time for regular dismissal. Students should wear closed-toe shoes suitable for walking on uneven trails and bring a labelled water bottle. Please dress your child in layers, as part of the day will be spent outdoors regardless of weather, unless there is a severe weather warning.\n\nThe trip costs $18 per student, which covers bus transportation and the centre's program fee. Payment and the attached permission slip must be submitted to your child's teacher by Monday, October 5th. Students who have not returned the form by that date will stay at school and complete alternate classroom activities with Room 12.\n\nPlease note that this trip is nut-free, as the Nature Centre has visitors with severe allergies; snacks containing peanuts or tree nuts will not be permitted on the bus.\n\nWe are still looking for two parent volunteers per class to help supervise. If you are available and have a current criminal record check on file with the school, please email your child's teacher by September 30th.\n\nThank you,\nMrs. Denise Whitfield\nGrade 5 Team",
    "questions": [
      {
        "q": "Where is the Grade 5 field trip going?",
        "options": [
          "Elmwood Public School",
          "Pinehollow Nature Centre",
          "A local farm",
          "A science museum"
        ],
        "answer": 1
      },
      {
        "q": "Which classes are attending the trip?",
        "options": [
          "Room 12 and Room 14",
          "Room 14 and Room 16",
          "All Grade 5 classes",
          "Room 16 only"
        ],
        "answer": 1
      },
      {
        "q": "What time will students return to school?",
        "options": [
          "8:45 AM",
          "12:00 PM",
          "3:15 PM",
          "4:00 PM"
        ],
        "answer": 2
      },
      {
        "q": "What footwear is required for the trip?",
        "options": [
          "Rain boots",
          "Closed-toe shoes suitable for uneven trails",
          "Sandals",
          "No specific requirement"
        ],
        "answer": 1
      },
      {
        "q": "How much does the trip cost per student, and what does it cover?",
        "options": [
          "$18, covering bus and program fee",
          "$25, covering lunch only",
          "$10, bus only",
          "Free for all students"
        ],
        "answer": 0
      },
      {
        "q": "What is the deadline to submit the permission slip and payment?",
        "options": [
          "October 9th",
          "October 5th",
          "September 30th",
          "October 12th"
        ],
        "answer": 1
      },
      {
        "q": "What happens to students who don't submit the form by the deadline?",
        "options": [
          "They cannot attend school that day",
          "They stay at school with Room 12 for alternate activities",
          "They must pay double the fee",
          "They are automatically enrolled anyway"
        ],
        "answer": 1
      },
      {
        "q": "What food restriction applies to the trip?",
        "options": [
          "No dairy products",
          "No nut products of any kind",
          "Vegetarian only",
          "No red meat"
        ],
        "answer": 1
      },
      {
        "q": "What does the trip include besides the forest walk?",
        "options": [
          "A boat ride and a picnic",
          "A pond study activity and a wetland conservation presentation",
          "A camping overnight stay",
          "A swimming lesson"
        ],
        "answer": 1
      },
      {
        "q": "What is required of parents who want to volunteer?",
        "options": [
          "Nothing, anyone can volunteer",
          "A current criminal record check on file",
          "A separate fee payment",
          "Attendance at a training session"
        ],
        "answer": 1
      },
      {
        "q": "By when must interested volunteer parents email the teacher?",
        "options": [
          "October 5th",
          "October 9th",
          "September 30th",
          "October 12th"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "R1-05",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Notice: Homeowners Association Annual General Meeting",
    "text": "Subject: Notice of Annual General Meeting — Fernwood Estates Homeowners Association\n\nDear Homeowners,\n\nThe Fernwood Estates Homeowners Association will hold its Annual General Meeting on Tuesday, November 12th, at 7:00 PM in the clubhouse at 22 Fernwood Crescent. All homeowners are encouraged to attend, as we will be voting on two proposed bylaw amendments and electing two new board members.\n\nThe first proposed amendment would raise the maximum fence height in backyards from 1.8 metres to 2.1 metres, following several requests from residents wanting more privacy. The second would require all short-term rentals (stays under 30 days) to be registered with the board and limited to a maximum of 90 rental days per calendar year.\n\nThis year's annual dues will also be discussed; the board is proposing an increase from $340 to $375 per household to cover rising landscaping and snow removal contract costs, effective January 1st.\n\nIf you cannot attend in person, proxy voting forms are available at the clubhouse office or by email request to admin@fernwoodhoa.example until November 8th. Only forms received by that date will be counted.\n\nLight refreshments will be served starting at 6:30 PM. Parking is available in the clubhouse lot, but please leave the first ten spaces near the entrance for board members transporting meeting materials.\n\nTwo board positions are open this year: Treasurer and Landscaping Committee Chair. Homeowners interested in running should submit a short candidacy statement to the current board by November 5th.\n\nWe look forward to seeing you there.\n\nFernwood Estates HOA Board",
    "questions": [
      {
        "q": "When and where is the Annual General Meeting being held?",
        "options": [
          "Nov 12, 7 PM at the clubhouse",
          "Nov 8, 6 PM at the community garden",
          "Nov 5, 7 PM at a member's home",
          "Dec 1, 7 PM at the clubhouse"
        ],
        "answer": 0
      },
      {
        "q": "What is one of the two proposed bylaw amendments?",
        "options": [
          "Banning all pets",
          "Raising the maximum fence height from 1.8m to 2.1m",
          "Eliminating annual dues",
          "Closing the clubhouse permanently"
        ],
        "answer": 1
      },
      {
        "q": "What restriction would the second proposed amendment place on short-term rentals?",
        "options": [
          "Banning them outright",
          "Requiring registration and a 90-day annual limit",
          "Allowing unlimited rental days",
          "Requiring a $500 deposit"
        ],
        "answer": 1
      },
      {
        "q": "What increase to annual dues is being proposed?",
        "options": [
          "$340 to $375",
          "$375 to $400",
          "$300 to $340",
          "No increase is proposed"
        ],
        "answer": 0
      },
      {
        "q": "Why is the dues increase being proposed?",
        "options": [
          "To fund a new pool",
          "Rising landscaping and snow removal costs",
          "Legal fees from a lawsuit",
          "To build a new clubhouse"
        ],
        "answer": 1
      },
      {
        "q": "By when must proxy voting forms be received to be counted?",
        "options": [
          "November 5th",
          "November 8th",
          "November 12th",
          "November 30th"
        ],
        "answer": 1
      },
      {
        "q": "Where can homeowners obtain a proxy voting form?",
        "options": [
          "Only by mail",
          "The clubhouse office or by email request",
          "The city hall",
          "Online only, no other option"
        ],
        "answer": 1
      },
      {
        "q": "What time do refreshments begin, relative to the meeting start?",
        "options": [
          "30 minutes before the meeting",
          "At the same time as the meeting",
          "One hour after the meeting starts",
          "The next morning"
        ],
        "answer": 0
      },
      {
        "q": "What parking instruction is given to homeowners?",
        "options": [
          "Park only on the street",
          "Leave the first ten spaces near the entrance for board members",
          "No parking is available",
          "Carpool is mandatory"
        ],
        "answer": 1
      },
      {
        "q": "Which two board positions are open for election this year?",
        "options": [
          "President and Secretary",
          "Treasurer and Landscaping Committee Chair",
          "Vice President and Treasurer",
          "Secretary and Social Committee Chair"
        ],
        "answer": 1
      },
      {
        "q": "By when must candidacy statements be submitted?",
        "options": [
          "November 8th",
          "November 12th",
          "November 5th",
          "November 1st"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "R1-06",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Notice: Gym Membership Changes Due to Location Closure",
    "text": "Subject: Important Changes to Your Vantage Fitness Membership\n\nDear Member,\n\nWe're writing to let you know about changes to your membership at Vantage Fitness, effective November 1st. Our downtown location at 88 Harbour Street will be closing permanently on October 31st due to the building's redevelopment, and all downtown memberships will be automatically transferred to our Riverside location, 2.3 kilometres away, at no change in price.\n\nIf the Riverside location is not convenient for you, you have three options. First, you may switch to our online-only membership at $19/month, which includes access to live-streamed classes and our workout app. Second, you may place your membership on a paused status for up to 3 months at no charge while you decide. Third, you may cancel entirely with no penalty, provided you submit a cancellation request before October 25th; cancellations after that date will incur the standard 30-day notice fee of $45.\n\nMembers with a current punch card (10-visit pass) will have their remaining visits honoured at any Vantage location until the card's original expiry date.\n\nThe downtown location's final operating hours will be 6:00 AM to 8:00 PM daily from October 20th through the 31st, shortened from the usual 5:00 AM to 10:00 PM, to allow staff to begin decommissioning equipment in the evenings.\n\nTo select an option, log into your account or speak with any front desk staff member by October 25th. If no selection is made, your account will default to the Riverside transfer.\n\nThank you for your understanding.\n\nVantage Fitness Member Services",
    "questions": [
      {
        "q": "Why is the downtown Vantage Fitness location closing?",
        "options": [
          "Low membership numbers",
          "The building's redevelopment",
          "A change in ownership",
          "Health code violations"
        ],
        "answer": 1
      },
      {
        "q": "What happens by default to downtown memberships?",
        "options": [
          "They are cancelled automatically",
          "They transfer to the Riverside location at the same price",
          "They double in price",
          "They convert to online-only"
        ],
        "answer": 1
      },
      {
        "q": "How far is the Riverside location from downtown?",
        "options": [
          "1 km",
          "2.3 km",
          "5 km",
          "10 km"
        ],
        "answer": 1
      },
      {
        "q": "What is the monthly cost of the online-only membership option?",
        "options": [
          "$9",
          "$19",
          "$29",
          "$45"
        ],
        "answer": 1
      },
      {
        "q": "For how long can a member pause their membership at no charge?",
        "options": [
          "1 month",
          "2 months",
          "3 months",
          "6 months"
        ],
        "answer": 2
      },
      {
        "q": "What happens if a member cancels after October 25th?",
        "options": [
          "Nothing, cancellation is always free",
          "A $45 standard notice fee applies",
          "They lose their punch card visits",
          "They must pay for a full year"
        ],
        "answer": 1
      },
      {
        "q": "What happens to unused visits on a punch card?",
        "options": [
          "They are forfeited when downtown closes",
          "They are honoured at any Vantage location until the original expiry date",
          "They convert to cash refunds",
          "They can only be used at Riverside"
        ],
        "answer": 1
      },
      {
        "q": "What are the shortened hours at the downtown location from October 20-31st?",
        "options": [
          "5 AM to 10 PM",
          "6 AM to 8 PM",
          "7 AM to 9 PM",
          "Closed entirely"
        ],
        "answer": 1
      },
      {
        "q": "Why are the hours being shortened during this period?",
        "options": [
          "Reduced staff availability",
          "To allow staff to begin decommissioning equipment in the evenings",
          "Lower member attendance",
          "City noise bylaws"
        ],
        "answer": 1
      },
      {
        "q": "By when must members select one of the three options?",
        "options": [
          "October 20th",
          "October 25th",
          "October 31st",
          "November 1st"
        ],
        "answer": 1
      },
      {
        "q": "What happens if a member makes no selection at all?",
        "options": [
          "Their membership is cancelled",
          "Their account defaults to the Riverside transfer",
          "They are charged a penalty fee",
          "They lose all their benefits"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-07",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Invitation: Annual Charity Gala",
    "text": "Subject: You're Invited: Maple Ridge Children's Fund Annual Gala\n\nDear Supporter,\n\nYou are warmly invited to the Maple Ridge Children's Fund's 15th Annual Gala, taking place Saturday, November 22nd, at the Lakeshore Convention Centre, 400 Harbourfront Drive. Doors open at 6:00 PM for a cocktail reception, with dinner served at 7:30 PM, followed by our keynote speaker and live auction beginning at 8:30 PM.\n\nThis year's theme is 'A Night in Venice,' and while formal attire is requested, costumes or masks related to the theme are welcome but not required. Individual tickets are $150, or reserve a table of eight for $1,100, a savings of $100 compared to buying eight tickets separately. All proceeds go directly toward our after-school tutoring programs for children in the Maple Ridge school district.\n\nThe live auction will feature over 40 items, including a weekend cabin stay, restaurant gift certificates, and a signed piece of local artwork. Silent auction bidding opens online on November 15th and will also be available on tablets at the event for guests who prefer to bid in person.\n\nParking is available in the convention centre's underground garage; validated parking is included with your ticket, but please bring your parking stub to the registration table to have it stamped.\n\nPlease RSVP by November 8th by visiting our website or calling 555-0142, and note any dietary restrictions at that time so our caterer can accommodate you. Seating is assigned, so late RSVPs may result in placement at a shared table rather than with your chosen party.\n\nWe hope to see you there for a memorable evening supporting local children.\n\nMaple Ridge Children's Fund",
    "questions": [
      {
        "q": "What is this year's gala theme?",
        "options": [
          "A Night in Paris",
          "A Night in Venice",
          "Under the Stars",
          "Roaring Twenties"
        ],
        "answer": 1
      },
      {
        "q": "What time does the cocktail reception begin?",
        "options": [
          "6:00 PM",
          "7:30 PM",
          "8:30 PM",
          "5:00 PM"
        ],
        "answer": 0
      },
      {
        "q": "What is the cost of an individual ticket compared to a table of eight?",
        "options": [
          "$150 individual; $1,100 for a table of eight",
          "$200 individual; $1,500 for a table",
          "$100 individual; $900 for a table",
          "Tickets are free with a suggested donation"
        ],
        "answer": 0
      },
      {
        "q": "How much is saved by booking a table of eight instead of buying eight individual tickets?",
        "options": [
          "$50",
          "$100",
          "$150",
          "$200"
        ],
        "answer": 1
      },
      {
        "q": "What do the gala proceeds support?",
        "options": [
          "Hospital equipment",
          "After-school tutoring programs for children in the district",
          "Building a new community centre",
          "Wildlife conservation"
        ],
        "answer": 1
      },
      {
        "q": "When does online silent auction bidding open?",
        "options": [
          "November 8th",
          "November 15th",
          "November 22nd",
          "At the event only"
        ],
        "answer": 1
      },
      {
        "q": "What must guests do with their parking stub?",
        "options": [
          "Nothing, parking is automatic",
          "Bring it to the registration table to be stamped",
          "Mail it in for reimbursement",
          "Display it on their dashboard"
        ],
        "answer": 1
      },
      {
        "q": "By when should guests RSVP?",
        "options": [
          "November 15th",
          "November 22nd",
          "November 8th",
          "November 1st"
        ],
        "answer": 2
      },
      {
        "q": "Why should guests note dietary restrictions when RSVPing?",
        "options": [
          "It's required for ticket purchase",
          "So the caterer can accommodate them",
          "To qualify for a discount",
          "It's optional and has no effect"
        ],
        "answer": 1
      },
      {
        "q": "What might happen if someone RSVPs late?",
        "options": [
          "They are refused entry",
          "They may be seated at a shared table instead of with their chosen party",
          "They must pay double",
          "They lose auction bidding privileges"
        ],
        "answer": 1
      },
      {
        "q": "Is formal attire required to attend?",
        "options": [
          "Yes, with no exceptions",
          "Formal attire is requested; costumes/masks are optional",
          "Only costumes are allowed",
          "Casual dress is required"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-08",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Email: Response to a Noise Complaint",
    "text": "Subject: Re: Noise Complaint — Unit 512\n\nDear Mr. Castillo,\n\nThank you for your email of August 3rd regarding ongoing noise from the unit above yours, Unit 512, particularly late-night footsteps and furniture moving between 11:00 PM and 1:00 AM. I want to assure you that we take this seriously and have already begun addressing it.\n\nI spoke with the residents of Unit 512 on August 5th. They explained that they recently adopted a large dog and have been rearranging furniture over the past two weeks to puppy-proof the apartment, which should be finished by August 15th. They were unaware the noise was carrying and have agreed to add felt pads under furniture legs and to avoid moving items after 10:00 PM going forward.\n\nOur building's quiet hours policy, outlined in your lease, applies from 10:00 PM to 7:00 AM daily. If the noise continues past August 15th or occurs during quiet hours again, please document the dates and times and contact building security directly at extension 311; a documented pattern allows us to issue a formal lease violation notice to the unit.\n\nAs a gesture of goodwill for the disruption to your sleep over the past two weeks, we are crediting your account $50 toward next month's rent.\n\nIn the meantime, if the noise becomes unbearable at night, our after-hours line, 555-0199, is staffed until 2:00 AM and can send someone to assess the situation in real time.\n\nPlease let me know if this resolution is satisfactory or if you'd like to discuss further.\n\nSincerely,\nRachel Nkemelu\nProperty Manager, Birchwood Towers",
    "questions": [
      {
        "q": "What was Mr. Castillo's complaint about?",
        "options": [
          "A water leak",
          "Noise from Unit 512 late at night",
          "A parking dispute",
          "A pet allergy"
        ],
        "answer": 1
      },
      {
        "q": "During what hours was the noise occurring?",
        "options": [
          "7 AM to 9 AM",
          "11 PM to 1 AM",
          "2 PM to 4 PM",
          "10 PM to midnight"
        ],
        "answer": 1
      },
      {
        "q": "What did the manager learn was causing the noise in Unit 512?",
        "options": [
          "A renovation project",
          "A new dog and furniture rearranging to puppy-proof the apartment",
          "A late-night party",
          "A broken appliance"
        ],
        "answer": 1
      },
      {
        "q": "What did the residents of Unit 512 agree to do going forward?",
        "options": [
          "Move out",
          "Add felt pads under furniture and avoid moving items after 10 PM",
          "Give up their dog",
          "Pay a fine"
        ],
        "answer": 1
      },
      {
        "q": "What are the building's official quiet hours?",
        "options": [
          "9 PM to 6 AM",
          "10 PM to 7 AM",
          "11 PM to 8 AM",
          "Midnight to 5 AM"
        ],
        "answer": 1
      },
      {
        "q": "What should Mr. Castillo do if the noise continues past August 15th?",
        "options": [
          "Move out immediately",
          "Document the dates/times and contact security at extension 311",
          "Confront the neighbours directly",
          "Call the police only"
        ],
        "answer": 1
      },
      {
        "q": "Why does the manager ask him to document any further incidents?",
        "options": [
          "For insurance purposes",
          "To allow issuance of a formal lease violation notice if a pattern is shown",
          "To bill Unit 512 directly",
          "It's not explained"
        ],
        "answer": 1
      },
      {
        "q": "What goodwill gesture is being offered to Mr. Castillo?",
        "options": [
          "A free parking spot",
          "A $50 credit toward next month's rent",
          "A unit transfer",
          "A gift card"
        ],
        "answer": 1
      },
      {
        "q": "What is the after-hours contact line, and until when is it staffed?",
        "options": [
          "555-0199, until 2 AM",
          "555-0311, until midnight",
          "555-0199, until 6 AM",
          "There is no after-hours line"
        ],
        "answer": 0
      },
      {
        "q": "What can the after-hours line do?",
        "options": [
          "Only take messages",
          "Send someone to assess the situation in real time",
          "Issue refunds",
          "Contact Unit 512 directly for the resident"
        ],
        "answer": 1
      },
      {
        "q": "By when did Unit 512 residents expect to finish their furniture rearranging?",
        "options": [
          "August 3rd",
          "August 5th",
          "August 15th",
          "September 1st"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "R1-09",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Email: Dental Appointment Reschedule Confirmation",
    "text": "Subject: Your Appointment Has Been Rescheduled — Brightsmile Dental\n\nDear Mr. Okafor,\n\nThis is a follow-up to confirm that your dental cleaning and checkup, originally scheduled for Tuesday, September 16th at 10:30 AM with Dr. Feldman, has been moved to Thursday, September 18th at 2:15 PM due to Dr. Feldman being called away for a family emergency.\n\nIf this new time does not work for you, we can offer you an appointment with Dr. Suzuki on the original date and time instead, or you may choose another slot from our online booking system. To keep the September 18th appointment with Dr. Feldman, no action is needed on your part.\n\nAs a reminder, this visit includes a routine cleaning, a full set of X-rays (which you are due for, since your last set was over 12 months ago), and a cavity check. Please arrive 15 minutes early to complete an updated medical history form, especially since you mentioned starting a new medication at your last visit.\n\nIf you have dental insurance through a new employer since your last visit, please bring your updated insurance card so we can verify coverage before treatment; otherwise, payment will be collected in full at the time of service and you can submit the receipt to your insurer yourself.\n\nPlease note our 24-hour cancellation policy: cancelling or rescheduling with less than 24 hours' notice will result in a $35 missed-appointment fee.\n\nTo confirm, reschedule again, or ask questions, please call us at 555-0176 or reply to this email.\n\nWe look forward to seeing you.\n\nBrightsmile Dental Clinic",
    "questions": [
      {
        "q": "What was the original date and time of the appointment?",
        "options": [
          "Sept 16, 10:30 AM",
          "Sept 18, 2:15 PM",
          "Sept 18, 10:30 AM",
          "Sept 16, 2:15 PM"
        ],
        "answer": 0
      },
      {
        "q": "Why was the appointment rescheduled?",
        "options": [
          "Clinic closure",
          "Dr. Feldman had a family emergency",
          "Equipment malfunction",
          "Patient requested it"
        ],
        "answer": 1
      },
      {
        "q": "What alternative was offered if the new time doesn't work?",
        "options": [
          "A full refund",
          "Keep the original date/time with Dr. Suzuki instead",
          "Cancel with no rebooking",
          "Wait until next year"
        ],
        "answer": 1
      },
      {
        "q": "What does the patient need to do to keep the September 18th appointment?",
        "options": [
          "Call to confirm",
          "Pay a deposit",
          "Nothing, no action is needed",
          "Email the clinic"
        ],
        "answer": 2
      },
      {
        "q": "Why is the patient due for a full set of X-rays?",
        "options": [
          "It's required for all patients annually",
          "His last set was over 12 months ago",
          "He requested them",
          "New insurance requires it"
        ],
        "answer": 1
      },
      {
        "q": "How early should the patient arrive, and why?",
        "options": [
          "30 minutes early, for X-rays",
          "15 minutes early, to complete an updated medical history form",
          "No early arrival needed",
          "1 hour early, for a consultation"
        ],
        "answer": 1
      },
      {
        "q": "Why is the updated medical history form especially relevant this time?",
        "options": [
          "He changed his address",
          "He mentioned starting a new medication at his last visit",
          "He has a new insurance provider",
          "He missed his last appointment"
        ],
        "answer": 1
      },
      {
        "q": "What should the patient bring if he has new dental insurance?",
        "options": [
          "A doctor's referral",
          "His updated insurance card",
          "Proof of income",
          "Nothing is needed"
        ],
        "answer": 1
      },
      {
        "q": "What happens if a patient doesn't provide updated insurance information?",
        "options": [
          "The appointment is cancelled",
          "Payment is collected in full and the patient submits the receipt to their insurer",
          "The clinic bills the old insurer",
          "The visit is free"
        ],
        "answer": 1
      },
      {
        "q": "What is the fee for cancelling with less than 24 hours' notice?",
        "options": [
          "$15",
          "$25",
          "$35",
          "$50"
        ],
        "answer": 2
      },
      {
        "q": "How can the patient confirm, reschedule, or ask questions?",
        "options": [
          "Only by visiting in person",
          "By calling 555-0176 or replying to the email",
          "Through a mobile app only",
          "By contacting Dr. Suzuki directly"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-10",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Email: Professional Association Membership Renewal",
    "text": "Subject: Your CIPM Membership Renewal — Action Needed by October 1st\n\nDear Ms. Delacroix,\n\nYour membership with the Canadian Institute of Project Managers (CIPM) is due for renewal on October 1st. Renewing keeps your Certified Project Manager (CPM) designation active and ensures uninterrupted access to member benefits, including the online resource library and discounted conference registration.\n\nThis year, the standard renewal fee is $295, a $15 increase from last year to cover the cost of our new digital credentialing system. However, members who renew before September 15th qualify for an early-bird rate of $265. Members who let their membership lapse for more than 60 days after the October 1st deadline will need to retake the certification exam ($400) to reinstate their CPM designation, rather than simply paying the renewal fee.\n\nAs part of this year's renewal, you're also required to log at least 20 hours of continuing education completed since your last renewal; you currently show 14 hours logged in our system. You can complete the remaining hours through our free webinar series, with three sessions available before the deadline, or submit proof of external training for review.\n\nOnce renewed, your digital membership card and updated CPM certificate will be available in your online portal within 3 business days. A physical card can be mailed to you for an additional $10 if requested during checkout.\n\nTo renew, log in to your account at cipm-members.example or call our membership line at 555-0188.\n\nThank you for your continued membership.\n\nCIPM Membership Services",
    "questions": [
      {
        "q": "When is the CIPM membership renewal due?",
        "options": [
          "September 15th",
          "October 1st",
          "December 5th",
          "January 1st"
        ],
        "answer": 1
      },
      {
        "q": "What does renewing keep active?",
        "options": [
          "A parking permit",
          "The Certified Project Manager (CPM) designation",
          "A library card",
          "Nothing specific"
        ],
        "answer": 1
      },
      {
        "q": "What is the standard renewal fee this year, and why did it increase?",
        "options": [
          "$265, due to inflation",
          "$295, due to a new digital credentialing system",
          "$400, due to exam costs",
          "$180, no increase mentioned"
        ],
        "answer": 1
      },
      {
        "q": "What is the early-bird rate, and by when must someone renew to get it?",
        "options": [
          "$265, before September 15th",
          "$295, before October 1st",
          "$250, before August 1st",
          "$300, before November 1st"
        ],
        "answer": 0
      },
      {
        "q": "What happens if a membership lapses more than 60 days past the deadline?",
        "options": [
          "Automatic reinstatement",
          "The member must retake the certification exam for $400",
          "A late fee of $50 applies",
          "Nothing changes"
        ],
        "answer": 1
      },
      {
        "q": "How many continuing education hours are required for this renewal?",
        "options": [
          "10 hours",
          "14 hours",
          "20 hours",
          "30 hours"
        ],
        "answer": 2
      },
      {
        "q": "How many continuing education hours does Ms. Delacroix currently have logged?",
        "options": [
          "14",
          "20",
          "6",
          "0"
        ],
        "answer": 0
      },
      {
        "q": "How can she complete her remaining required hours?",
        "options": [
          "Only by retaking the exam",
          "Through free webinars or by submitting proof of external training",
          "She cannot complete them in time",
          "By paying an extra fee instead"
        ],
        "answer": 1
      },
      {
        "q": "How soon after renewal will the digital membership card be available?",
        "options": [
          "Immediately",
          "Within 3 business days",
          "Within 2 weeks",
          "Within 30 days"
        ],
        "answer": 1
      },
      {
        "q": "How much extra does a physical membership card cost?",
        "options": [
          "Free",
          "$5",
          "$10",
          "$25"
        ],
        "answer": 2
      },
      {
        "q": "How can a member renew their membership?",
        "options": [
          "Only by mail",
          "Online at cipm-members.example or by calling 555-0188",
          "In person only",
          "Through their employer only"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-11",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Notice: Planned Power Outage in Greenfield District",
    "text": "Subject: Planned Power Outage Notice — Greenfield District, September 22nd\n\nDear Customer,\n\nNorthgate Hydro will be performing scheduled maintenance on power lines serving the Greenfield District, including Willow Street, Oak Court, and Birchwood Lane. Power will be interrupted from 9:00 AM to 3:00 PM on Sunday, September 22nd, to allow crews to replace aging transformers that have caused several outages in the area over the past year.\n\nThis date was chosen specifically because it is a weekend with mild weather forecast, minimizing disruption for customers who work from home on weekdays. If weather conditions are unsafe for crews on September 22nd, the work will be postponed to the backup date of September 29th, and we will notify affected customers by text and email at least 24 hours before either date.\n\nDuring the outage, customers with medical equipment requiring continuous power, such as oxygen concentrators or dialysis machines, should activate backup power sources or contact our Medical Priority Line at 555-0155 to arrange a temporary generator, available on a first-come basis while supplies last.\n\nWe recommend unplugging sensitive electronics before the outage to avoid damage from the momentary power surge that sometimes occurs when service is restored. Traffic lights at the intersection of Willow and Main will be replaced with temporary stop signs during the work; please drive with caution.\n\nFor real-time updates during the outage, visit our website's outage map or call our automated line at 555-0166.\n\nWe apologize for any inconvenience this necessary maintenance may cause.\n\nNorthgate Hydro",
    "questions": [
      {
        "q": "Which streets are affected by the planned outage?",
        "options": [
          "Main Street and Elm Avenue",
          "Willow Street, Oak Court, and Birchwood Lane",
          "Harbourfront Drive only",
          "All of Greenfield District equally including downtown"
        ],
        "answer": 1
      },
      {
        "q": "What is the scheduled date and time of the outage?",
        "options": [
          "Sept 22, 9 AM-3 PM",
          "Sept 29, 9 AM-3 PM",
          "Sept 22, 6 AM-6 PM",
          "Sept 20, 9 AM-3 PM"
        ],
        "answer": 0
      },
      {
        "q": "Why is the outage necessary?",
        "options": [
          "Storm damage repair",
          "Replacing aging transformers that caused past outages",
          "Installing new streetlights",
          "A scheduled system test"
        ],
        "answer": 1
      },
      {
        "q": "Why was this particular date chosen?",
        "options": [
          "It's a legal requirement",
          "A weekend with mild weather forecast, minimizing disruption",
          "It's the cheapest day for crews",
          "Random selection"
        ],
        "answer": 1
      },
      {
        "q": "What is the backup date if the work must be postponed?",
        "options": [
          "September 15th",
          "September 20th",
          "September 29th",
          "October 1st"
        ],
        "answer": 2
      },
      {
        "q": "How will customers be notified if the date changes?",
        "options": [
          "A knock on the door",
          "Text and email at least 24 hours before either date",
          "A newspaper ad",
          "They won't be notified"
        ],
        "answer": 1
      },
      {
        "q": "What should customers with medical equipment requiring continuous power do?",
        "options": [
          "Nothing special is needed",
          "Activate backup power or call the Medical Priority Line for a generator",
          "Evacuate their homes",
          "Wait for the power to return"
        ],
        "answer": 1
      },
      {
        "q": "How are temporary generators for medical needs made available?",
        "options": [
          "Guaranteed to all who ask",
          "First-come basis while supplies last",
          "Only for hospitals",
          "Not available at all"
        ],
        "answer": 1
      },
      {
        "q": "Why is it recommended to unplug sensitive electronics before the outage?",
        "options": [
          "To save on electricity bills",
          "To avoid damage from a power surge when service is restored",
          "It's a legal requirement",
          "To help crews work faster"
        ],
        "answer": 1
      },
      {
        "q": "What temporary traffic change will occur during the work?",
        "options": [
          "Full road closure on Willow",
          "Temporary stop signs at Willow and Main replacing traffic lights",
          "A new speed limit citywide",
          "Detour signs on the highway"
        ],
        "answer": 1
      },
      {
        "q": "How can customers get real-time updates during the outage?",
        "options": [
          "Only by calling 911",
          "The website's outage map or the automated line at 555-0166",
          "Local radio only",
          "They cannot get updates"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R1-12",
    "partNum": 1,
    "part": "Part 1: Reading Correspondence",
    "title": "Update: Thornbury Park Renovation Timeline",
    "text": "Subject: Update: Thornbury Park Renovation Timeline\n\nDear Thornbury Neighbours,\n\nWe're excited to share an update on the renovation of Thornbury Park, funded jointly by the city and last year's community fundraising campaign, which raised $22,000 toward new playground equipment.\n\nConstruction begins Monday, September 8th, starting with the removal of the old wooden play structure, which will be replaced with an accessible, rubber-surfaced play area suitable for children of all abilities. This phase is expected to take three weeks, finishing around September 26th.\n\nDuring construction, the playground area will be fenced off, but the walking trail, splash pad, and picnic shelters will remain open, accessed via the Elm Street entrance rather than the usual Thornbury Avenue entrance, which will be used for construction vehicle access only.\n\nThe second phase, resurfacing the basketball court, is tentatively scheduled for October and will close the court for approximately 10 days. Exact dates will be shared once confirmed, as they depend on weather and the contractor's schedule following the playground work.\n\nThe dog off-leash area will be temporarily relocated to the field behind the community centre starting September 8th, since construction vehicles will need to pass near its current location.\n\nA ribbon-cutting ceremony celebrating the new playground is tentatively planned for the first Saturday in October, with details to follow closer to the date.\n\nWe thank everyone who donated or volunteered at fundraising events, and we appreciate your patience during construction.\n\nThornbury Neighbourhood Association",
    "questions": [
      {
        "q": "How was funding for the park renovation obtained?",
        "options": [
          "City funding alone",
          "Jointly by the city and a community fundraising campaign that raised $22,000",
          "Private donation from one resident",
          "Federal grant only"
        ],
        "answer": 1
      },
      {
        "q": "When does construction begin?",
        "options": [
          "September 8th",
          "September 26th",
          "October 1st",
          "August 30th"
        ],
        "answer": 0
      },
      {
        "q": "What is being replaced in phase one?",
        "options": [
          "The picnic shelters",
          "The old wooden play structure, with an accessible rubber-surfaced play area",
          "The splash pad",
          "The walking trail"
        ],
        "answer": 1
      },
      {
        "q": "How long is phase one expected to take?",
        "options": [
          "One week",
          "Three weeks",
          "Two months",
          "Ten days"
        ],
        "answer": 1
      },
      {
        "q": "What amenities remain open during construction?",
        "options": [
          "Nothing remains open",
          "The walking trail, splash pad, and picnic shelters",
          "Only the playground",
          "The basketball court"
        ],
        "answer": 1
      },
      {
        "q": "Which entrance should visitors use during construction, and why?",
        "options": [
          "Thornbury Avenue, reserved for the public",
          "Elm Street, since Thornbury Avenue is for construction vehicles only",
          "Neither entrance is open",
          "Both entrances remain equally open"
        ],
        "answer": 1
      },
      {
        "q": "What is phase two of the renovation?",
        "options": [
          "Adding a new playground",
          "Resurfacing the basketball court",
          "Building a splash pad",
          "Repaving the parking lot"
        ],
        "answer": 1
      },
      {
        "q": "Why aren't exact dates confirmed yet for phase two?",
        "options": [
          "Funding hasn't been approved",
          "It depends on weather and the contractor's schedule",
          "The city hasn't decided if it will happen",
          "Residents haven't voted on it"
        ],
        "answer": 1
      },
      {
        "q": "Where will the dog off-leash area move to during construction?",
        "options": [
          "It will close entirely",
          "The field behind the community centre",
          "Elm Street",
          "A nearby private property"
        ],
        "answer": 1
      },
      {
        "q": "Why is the dog off-leash area being relocated?",
        "options": [
          "Noise complaints",
          "Construction vehicles will pass near its current location",
          "It's being permanently removed",
          "Low usage"
        ],
        "answer": 1
      },
      {
        "q": "When is the ribbon-cutting ceremony tentatively planned?",
        "options": [
          "Last Saturday of September",
          "First Saturday of October",
          "September 26th",
          "The same day construction begins"
        ],
        "answer": 1
      }
    ]
  }
];

const READING_PART2 = [
  {
    "id": "R2-01",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Public Library Event Calendar",
    "text": "Riverdale Public Library — September Program Calendar\n\nMonday:\n- Baby Rhyme Time (ages 0-2) — 10:00-10:30 AM — Storytime Room — No registration required\n- Teen Homework Help — 3:30-5:00 PM — Study Room B — Drop-in\n\nTuesday:\n- Preschool Storytime (ages 3-5) — 10:30-11:15 AM — Storytime Room — No registration required\n- Book Club: Mystery Genre (adults) — 7:00-8:15 PM — Meeting Room A — Registration required, limit 15\n\nWednesday:\n- Coding Club (ages 8-12) — 4:00-5:00 PM — Computer Lab — Registration required, limit 12\n- ESL Conversation Circle (adults) — 6:00-7:00 PM — Meeting Room A — No registration required\n\nThursday:\n- Baby Rhyme Time (ages 0-2) — 10:00-10:30 AM — Storytime Room — No registration required\n- Job Search Workshop (adults) — 2:00-3:30 PM — Meeting Room B — Registration required, limit 20\n\nSaturday:\n- Family Craft Morning (all ages) — 10:00 AM-12:00 PM — Community Room — No registration required, materials fee $2/child\n- Teen Gaming Lounge (ages 12-17) — 1:00-3:00 PM — Study Room B — Drop-in\n\nNotes: Registration for all programs opens two weeks in advance online or at the front desk. Meeting Room A is closed for private bookings on the first Tuesday of each month, so Book Club moves to Meeting Room B that week only. The library is closed on statutory holidays, and Saturday programs are cancelled on long weekends.",
    "questions": [
      {
        "q": "A parent wants to bring their 4-year-old to a program that needs no registration on a weekday morning. Which program fits?",
        "options": [
          "Baby Rhyme Time on Monday",
          "Preschool Storytime on Tuesday",
          "Coding Club on Wednesday",
          "Teen Gaming Lounge on Saturday"
        ],
        "answer": 1
      },
      {
        "q": "An adult who is only free on weekday evenings wants to join Book Club. What is true about this program?",
        "options": [
          "It requires no registration",
          "It requires registration and is limited to 15 people",
          "It's only for teens",
          "It has no limit on participants"
        ],
        "answer": 1
      },
      {
        "q": "A teen wants both structured homework help and casual gaming during the week. On which days can they find both, combined across the week?",
        "options": [
          "Monday and Saturday",
          "Tuesday and Wednesday",
          "Thursday and Friday",
          "Monday and Tuesday only"
        ],
        "answer": 0
      },
      {
        "q": "A parent brings two children to Family Craft Morning. What will they pay in materials fees?",
        "options": [
          "$2 total",
          "$4 total",
          "Nothing, it's free",
          "$10 total"
        ],
        "answer": 1
      },
      {
        "q": "How far in advance does registration open for programs that require it?",
        "options": [
          "One week",
          "Two weeks",
          "One month",
          "Same day only"
        ],
        "answer": 1
      },
      {
        "q": "What happens to Saturday programs on a long weekend?",
        "options": [
          "They run as scheduled",
          "They are cancelled",
          "They move to Sunday",
          "They run at half capacity"
        ],
        "answer": 1
      },
      {
        "q": "On the first Tuesday of the month, where does Book Club meet instead of its usual room?",
        "options": [
          "The Computer Lab",
          "Meeting Room B, since Meeting Room A is booked privately",
          "The Storytime Room",
          "It is cancelled that week"
        ],
        "answer": 1
      },
      {
        "q": "A parent wants to register their 12-year-old for Coding Club. What should they know?",
        "options": [
          "No registration is needed",
          "Registration is required and limited to 12 spots",
          "It's only for teens 13+",
          "It runs every day"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-02",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Fitness Studio Weekly Class Timetable",
    "text": "Pulse Fitness Studio — Weekly Class Timetable\n\nMonday:\n- Spin (All Levels) — 6:00-6:45 AM — Studio 1 — Instructor: Jana — $12 drop-in / free for members\n- HIIT Circuit (Intermediate) — 5:30-6:15 PM — Studio 2 — Instructor: Marcus — $15 drop-in / free for members\n\nTuesday:\n- Beginner Strength Training — 9:00-9:45 AM — Weight Room — Instructor: Priya — $10 drop-in / free for members\n- Power Yoga (Advanced) — 6:30-7:30 PM — Studio 1 — Instructor: Jana — $12 drop-in / free for members\n\nWednesday:\n- Spin (All Levels) — 6:00-6:45 AM — Studio 1 — Instructor: Marcus — $12 drop-in / free for members\n- Dance Cardio (All Levels) — 5:00-5:45 PM — Studio 2 — Instructor: Renée — $12 drop-in / free for members\n\nThursday:\n- Beginner Strength Training — 9:00-9:45 AM — Weight Room — Instructor: Priya — $10 drop-in / free for members\n- HIIT Circuit (Intermediate) — 5:30-6:15 PM — Studio 2 — Instructor: Marcus — $15 drop-in / free for members\n\nFriday:\n- Gentle Yoga (Beginner) — 8:00-8:45 AM — Studio 1 — Instructor: Renée — $10 drop-in / free for members\n- Power Yoga (Advanced) — 5:30-6:30 PM — Studio 1 — Instructor: Jana — $12 drop-in / free for members\n\nSaturday:\n- Family Fitness (all ages 6+) — 10:00-10:45 AM — Studio 2 — Instructor: Marcus — $8 drop-in / free for members\n\nNotes: Members must reserve a spot online at least 2 hours before class; unreserved spots are released to the drop-in waitlist 30 minutes before start time. The Weight Room has a maximum capacity of 15 and beginners are strongly encouraged to attend an orientation session before their first Beginner Strength Training class. Studio 1 classes require a yoga mat, available for rent at the front desk for $2.",
    "questions": [
      {
        "q": "Someone wants a beginner-level yoga class before work on a weekday morning. Which class fits?",
        "options": [
          "Power Yoga Friday 5:30 PM",
          "Gentle Yoga Friday 8:00 AM",
          "Spin Monday 6:00 AM",
          "Dance Cardio Wednesday 5:00 PM"
        ],
        "answer": 1
      },
      {
        "q": "A person is only free Tuesday and Thursday mornings and wants strength training. Which instructor teaches both sessions?",
        "options": [
          "Jana",
          "Marcus",
          "Priya",
          "Renée"
        ],
        "answer": 2
      },
      {
        "q": "What does a non-member pay to drop into a HIIT Circuit class?",
        "options": [
          "$10",
          "$12",
          "$15",
          "Free"
        ],
        "answer": 2
      },
      {
        "q": "A member wants a guaranteed spot in Wednesday's Dance Cardio class. What must they do?",
        "options": [
          "Just show up early",
          "Reserve online at least 2 hours before class",
          "Pay the drop-in fee anyway",
          "Call the front desk the day before"
        ],
        "answer": 1
      },
      {
        "q": "What happens to a reserved spot that a member doesn't claim?",
        "options": [
          "It stays empty",
          "It's released to the drop-in waitlist 30 minutes before class",
          "It's given to the instructor",
          "It's cancelled permanently for that member"
        ],
        "answer": 1
      },
      {
        "q": "What is recommended for someone attending their first Beginner Strength Training class?",
        "options": [
          "Bring a personal trainer",
          "Attend an orientation session first",
          "Arrive 30 minutes early",
          "Nothing special is needed"
        ],
        "answer": 1
      },
      {
        "q": "What do Studio 1 classes require that can be rented at the front desk?",
        "options": [
          "Resistance bands for $5",
          "A yoga mat for $2",
          "Weights for $10",
          "Nothing needs to be rented"
        ],
        "answer": 1
      },
      {
        "q": "What is the age requirement and drop-in cost for Saturday's Family Fitness class?",
        "options": [
          "Ages 6+, $8 drop-in",
          "Ages 12+, $15 drop-in",
          "All ages, free",
          "Ages 6+, free for everyone"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "R2-03",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "City Bus Route Schedule",
    "text": "Skyline Transit — Route 22: Downtown to Riverport Airport (Weekday Schedule)\n\nDowntown Terminal Departures:\n- 6:15 AM, 7:00 AM, 7:45 AM (Express, no stops between Downtown and Airport), 8:30 AM, 9:15 AM, then every 30 minutes until 6:15 PM, then every 45 minutes until 10:00 PM\n\nStops (Local service only, express skips all stops below):\n- Fairview Station — 8 minutes after Downtown departure\n- Kensington Mall — 16 minutes after Downtown departure\n- Oldtown Crossing — 24 minutes after Downtown departure\n- Riverport Airport (Terminal 1) — 35 minutes after Downtown departure (local); 22 minutes (express)\n\nFares:\n- Adult single ride: $3.50\n- Senior (65+) / Student (with valid ID): $2.25\n- Day Pass (unlimited rides): $9.00\n- Airport Express surcharge: additional $2.00 on top of single-ride fare, day pass not valid on Express\n\nNotes: The 7:45 AM Express bus is the only express trip on weekdays; all other Route 22 buses are local and stop at all four listed stops. Weekend schedule differs — buses run hourly from 7:00 AM to 9:00 PM local service only, no express. Cash fares require exact change; day passes can be purchased on board or via the Skyline Transit app.",
    "questions": [
      {
        "q": "A traveler wants to reach the airport as fast as possible on a weekday morning and doesn't mind paying extra. Which bus should they take, and what's the total adult fare?",
        "options": [
          "7:00 AM local, $3.50",
          "7:45 AM Express, $5.50",
          "8:30 AM local, $3.50",
          "9:15 AM Express, $2.00"
        ],
        "answer": 1
      },
      {
        "q": "A senior rides the local bus from Downtown to Kensington Mall. How long does the trip take and what does it cost?",
        "options": [
          "8 minutes, $3.50",
          "16 minutes, $2.25",
          "24 minutes, $2.25",
          "35 minutes, $3.50"
        ],
        "answer": 1
      },
      {
        "q": "A rider with a day pass wants to board the 7:45 AM Express bus. Is this allowed?",
        "options": [
          "Yes, day passes work on all buses",
          "No, day passes are not valid on the Express, so they must pay separately",
          "Yes, but only after 9 AM",
          "No, the Express doesn't run on weekdays"
        ],
        "answer": 1
      },
      {
        "q": "A traveler wants Express service on a Saturday morning. Is this available?",
        "options": [
          "Yes, hourly from 7 AM",
          "No, weekends run local service only, hourly from 7 AM to 9 PM",
          "Yes, but only after 12 PM",
          "No, there is no weekend service at all"
        ],
        "answer": 1
      },
      {
        "q": "What should a cash-paying rider bring when boarding?",
        "options": [
          "A credit card as backup",
          "Exact change",
          "A printed ticket",
          "Nothing extra is needed"
        ],
        "answer": 1
      },
      {
        "q": "How long does the local bus take from Downtown to Riverport Airport Terminal 1?",
        "options": [
          "22 minutes",
          "24 minutes",
          "35 minutes",
          "45 minutes"
        ],
        "answer": 2
      },
      {
        "q": "How often do weekday buses run in the evening after 6:15 PM?",
        "options": [
          "Every 15 minutes",
          "Every 30 minutes",
          "Every 45 minutes",
          "Every hour"
        ],
        "answer": 2
      },
      {
        "q": "A rider plans to take three local trips in one day. Would a day pass be cost-effective?",
        "options": [
          "No, single fares are always cheaper",
          "Yes, three rides at $3.50 each would cost more than the $9.00 day pass",
          "No, the day pass only covers one ride",
          "Yes, but only if riding the Express"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-04",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Car Rental Daily and Weekly Rate Sheet",
    "text": "Comet Car Rentals — Daily & Weekly Rate Sheet\n\nEconomy (e.g., compact sedan, seats 4):\n- Daily: $42 — Weekly (7 days): $245 (save $49) — Includes 200 km/day, $0.25/km after\n\nMidsize (e.g., sedan, seats 5):\n- Daily: $55 — Weekly: $320 (save $65) — Includes 250 km/day, $0.30/km after\n\nSUV (seats 7):\n- Daily: $78 — Weekly: $460 (save $86) — Includes 250 km/day, $0.35/km after\n\nCargo Van (2 seats, no rear passenger seating):\n- Daily: $90 — Weekly: $540 (save $90) — Unlimited km included\n\nAdd-ons:\n- Additional driver: $8/day (waived for weekly rentals)\n- Child car seat: $6/day for the first 5 consecutive days, free from the 6th day onward\n- GPS navigation unit: $5/day (free if booked via app)\n- Insurance waiver (covers deductible): $15/day\n\nNotes: Renters must be 25 or older for SUV and Cargo Van categories; renters aged 21-24 may book Economy or Midsize with a $20/day young-driver surcharge. All rentals require a valid driver's license and credit card in the renter's name. Fuel policy is full-to-full; vehicles returned with less fuel than at pickup incur a refill charge of $2.50/litre plus a $15 service fee.",
    "questions": [
      {
        "q": "A family of six plans a week-long trip and will drive more than 250 km per day. Which vehicle category fits their group size, and what should they expect regarding cost?",
        "options": [
          "Cargo Van, unlimited km included",
          "SUV, which includes 250 km/day with extra charges of $0.35/km beyond that",
          "Midsize, which seats 6 comfortably",
          "Economy, the cheapest option for large groups"
        ],
        "answer": 1
      },
      {
        "q": "A 23-year-old wants to rent a Midsize car for 3 days. What extra daily charge applies to them?",
        "options": [
          "No extra charge applies",
          "$8/day additional driver fee",
          "$20/day young-driver surcharge",
          "$15/day insurance waiver, mandatory for their age"
        ],
        "answer": 2
      },
      {
        "q": "A renter keeps a child car seat for 7 consecutive days. How much do they pay for it in total?",
        "options": [
          "$42 (7 days x $6)",
          "$30 (5 days x $6, then free)",
          "Free the entire time",
          "$36 (6 days x $6)"
        ],
        "answer": 1
      },
      {
        "q": "How much does a customer save by renting an Economy car for a week instead of paying the daily rate seven times?",
        "options": [
          "$35",
          "$49",
          "$65",
          "$90"
        ],
        "answer": 1
      },
      {
        "q": "How can a renter get the GPS navigation unit for free?",
        "options": [
          "Rent for a full week",
          "Book via the app",
          "Choose the SUV category",
          "It's always free"
        ],
        "answer": 1
      },
      {
        "q": "A 22-year-old wants to rent an SUV. Is this allowed?",
        "options": [
          "Yes, with no restrictions",
          "No, renters must be 25 or older for SUV and Cargo Van, though Economy or Midsize is available with a surcharge",
          "Yes, but only with a co-signer",
          "No, under-25 renters cannot rent any vehicle"
        ],
        "answer": 1
      },
      {
        "q": "A customer books a Midsize car for a full week and wants an additional driver. What is the cost?",
        "options": [
          "$8/day extra",
          "$56 total",
          "Waived, since it's a weekly rental",
          "$20/day extra"
        ],
        "answer": 2
      },
      {
        "q": "What happens if a renter returns a vehicle with less fuel than at pickup?",
        "options": [
          "Nothing, fuel level doesn't matter",
          "A refill charge of $2.50/litre plus a $15 service fee",
          "A flat $50 penalty",
          "They lose their deposit entirely"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-05",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Co-working Space Membership Plan Comparison",
    "text": "Nexus Workspace — Membership Plan Comparison\n\nDay Pass:\n- $25/day — Access to open seating area, 9:00 AM-6:00 PM — 2 hours of meeting room credit included — Wi-Fi and coffee included\n\nFlex Membership ($150/month):\n- Open seating, any time, 24/7 access — 5 hours of meeting room credit/month — Wi-Fi, coffee, and printing (50 pages/month) included — No long-term contract, cancel anytime with 7 days' notice\n\nDedicated Desk ($320/month):\n- Your own reserved desk, 24/7 access — 10 hours of meeting room credit/month — Locking storage drawer included — Requires 3-month minimum commitment\n\nPrivate Office (starting at $650/month, based on team size):\n- Lockable private room for 1-4 people, 24/7 access — Unlimited meeting room credit — Business mailing address service included — Requires 6-month minimum commitment\n\nAdd-ons (any plan):\n- Extra meeting room hours: $15/hour\n- Locker rental: $20/month\n- Guest day pass: $15/day (for visitors, not for regular use)\n\nNotes: Meeting room credit does not roll over to the next month. Flex and Dedicated Desk members receive a 10% discount on Private Office if they upgrade within their first 6 months. All plans include high-speed Wi-Fi; only Flex, Dedicated Desk, and Private Office include printing. Cancellation requires written notice: 7 days for Flex, 30 days for Dedicated Desk and Private Office.",
    "questions": [
      {
        "q": "A freelancer wants to try the space just once before committing to anything. What's the cheapest option?",
        "options": [
          "Flex Membership",
          "Day Pass at $25",
          "Dedicated Desk",
          "Private Office"
        ],
        "answer": 1
      },
      {
        "q": "Someone wants a reserved desk with locking storage but doesn't want a 6-month commitment. Which plan fits?",
        "options": [
          "Day Pass",
          "Flex Membership",
          "Dedicated Desk, which requires only a 3-month minimum",
          "Private Office"
        ],
        "answer": 2
      },
      {
        "q": "A team of three needs a lockable private room. Which plan applies, and what is the minimum commitment?",
        "options": [
          "Dedicated Desk, 3 months",
          "Flex Membership, no minimum",
          "Private Office, 6 months",
          "Day Pass, no minimum"
        ],
        "answer": 2
      },
      {
        "q": "A Flex member uses only 4 of their 5 monthly meeting room hours in March. What happens to the unused hour?",
        "options": [
          "It rolls over to April",
          "It is lost, since credit doesn't roll over",
          "It converts to a discount",
          "It's refunded in cash"
        ],
        "answer": 1
      },
      {
        "q": "A Flex member wants to upgrade to Private Office within their first 4 months. What benefit applies?",
        "options": [
          "No benefit applies",
          "A free month",
          "A 10% discount on Private Office",
          "Free meeting room hours for a year"
        ],
        "answer": 2
      },
      {
        "q": "Does a Day Pass include printing?",
        "options": [
          "Yes, unlimited",
          "Yes, 50 pages",
          "No, printing isn't included with Day Pass",
          "Only in the morning"
        ],
        "answer": 2
      },
      {
        "q": "A Dedicated Desk member wants to cancel. How much notice is required?",
        "options": [
          "7 days",
          "14 days",
          "30 days",
          "No notice required"
        ],
        "answer": 2
      },
      {
        "q": "What does it cost to get extra meeting room hours beyond a plan's monthly credit?",
        "options": [
          "$10/hour",
          "$15/hour",
          "$20/hour",
          "It's not possible to get extra hours"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-06",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Tech Conference Day 1 Agenda",
    "text": "NorthBridge Tech Summit — Day 1 Agenda (Thursday, October 15th)\n\n8:00-9:00 AM — Registration & Breakfast — Main Lobby\n9:00-9:30 AM — Opening Keynote: The Next Decade of Cloud Computing — Grand Hall — All attendees\n\n9:45-10:45 AM — Breakout Session A (choose one):\n- Track 1: Intro to Cloud Security — Room 101 — Beginner level\n- Track 2: Advanced Kubernetes Patterns — Room 102 — Advanced level, laptop required\n\n11:00 AM-12:00 PM — Breakout Session B (choose one):\n- Track 1: Building Your First API — Room 101 — Beginner level\n- Track 2: Scaling Databases at Enterprise Level — Room 103 — Advanced level\n\n12:00-1:15 PM — Lunch & Networking — Exhibit Hall\n1:30-2:30 PM — Panel: Ethics in AI Development — Grand Hall — All attendees\n2:45-3:45 PM — Workshop: Hands-On Machine Learning — Room 104 — Limited to 40 people, pre-registration required, laptop required\n4:00-5:00 PM — Closing Remarks & Networking Reception — Exhibit Hall\n\nNotes: All-access passes ($499) include every session. Day passes ($299) grant access to keynote, one breakout track per session, and the networking reception, but not the Machine Learning workshop, which requires the all-access pass regardless of which day pass is purchased. Attendees must bring their own laptop for any session marked \"laptop required.\" A printed schedule with room maps is available at registration; sessions marked Advanced assume at least 2 years of professional experience.",
    "questions": [
      {
        "q": "A beginner attendee wants both breakout sessions at beginner level with no laptop required. Which room should they go to both times?",
        "options": [
          "Room 102 then 103",
          "Room 101 for both sessions",
          "Room 104 then 101",
          "Room 103 then 104"
        ],
        "answer": 1
      },
      {
        "q": "A Day Pass holder wants to attend the Machine Learning workshop. Is this allowed?",
        "options": [
          "Yes, it's included in the Day Pass",
          "No, it requires an All-Access pass regardless of which day pass was purchased",
          "Yes, for an extra $50",
          "Only if they pre-register 3 days ahead"
        ],
        "answer": 1
      },
      {
        "q": "An attendee with only basic experience is choosing Breakout Session A. Which track suits them, and does it need a laptop?",
        "options": [
          "Track 2, laptop required",
          "Track 1, no laptop required",
          "Both tracks require a laptop",
          "Neither track is beginner-friendly"
        ],
        "answer": 1
      },
      {
        "q": "Which sessions require attendees to bring their own laptop?",
        "options": [
          "The opening keynote and the panel",
          "Advanced Kubernetes Patterns and Hands-On Machine Learning",
          "Building Your First API only",
          "All sessions require a laptop"
        ],
        "answer": 1
      },
      {
        "q": "Which pass allows access to every session, including the workshop?",
        "options": [
          "Day Pass at $299",
          "All-Access Pass at $499",
          "Both passes equally",
          "Neither pass includes the workshop"
        ],
        "answer": 1
      },
      {
        "q": "Is the networking reception included with a Day Pass?",
        "options": [
          "No, it's All-Access only",
          "Yes, it's included",
          "Only for an extra fee",
          "It's not mentioned"
        ],
        "answer": 1
      },
      {
        "q": "Which room and level is the enterprise database scaling session held at?",
        "options": [
          "Room 101, beginner",
          "Room 102, advanced",
          "Room 103, advanced",
          "Room 104, beginner"
        ],
        "answer": 2
      },
      {
        "q": "What time and location is lunch?",
        "options": [
          "12:00-1:15 PM, Exhibit Hall",
          "1:30-2:30 PM, Grand Hall",
          "11:00 AM-12:00 PM, Room 101",
          "12:00-1:00 PM, Main Lobby"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "R2-07",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Food Bank Volunteer Shift Sign-Up Sheet",
    "text": "Harvest Hope Food Bank — October Volunteer Shift Sign-Up\n\nMonday:\n- Morning Sort (9:00 AM-12:00 PM) — Warehouse — Max 8 volunteers — Task: sorting donated food by category\n- Evening Pack (5:00-7:30 PM) — Warehouse — Max 6 volunteers — Task: packing hamper boxes\n\nWednesday:\n- Morning Sort (9:00 AM-12:00 PM) — Warehouse — Max 8 volunteers\n- Client Intake Support (1:00-4:00 PM) — Front Desk — Max 3 volunteers — Task: greeting clients, checking in registrations; requires completed orientation\n\nFriday:\n- Delivery Driver Shift (10:00 AM-2:00 PM) — Off-site — Max 4 volunteers — Task: delivering hampers to homebound clients; valid driver's license required\n- Evening Pack (5:00-7:30 PM) — Warehouse — Max 6 volunteers\n\nSaturday:\n- Community Distribution Day (8:00 AM-1:00 PM) — Front Parking Lot — Max 15 volunteers — Task: handing out pre-packed hampers to walk-in clients; high physical activity, must be able to lift 10 kg boxes\n\nNotes: New volunteers must complete a one-time 30-minute orientation before their first shift, except for Morning Sort and Evening Pack shifts, which do not require orientation. Volunteers under 16 may only sign up with a parent or guardian also volunteering the same shift, and only for Morning Sort or Evening Pack. Sign-ups close 48 hours before each shift; cancellations should be made at least 24 hours in advance so the coordinator can find a replacement.",
    "questions": [
      {
        "q": "A 15-year-old wants to sign up alone for Friday's Delivery Driver shift. Is this allowed?",
        "options": [
          "Yes, with a parent's permission slip",
          "No, under-16 volunteers need a parent/guardian volunteering the same shift, and only for Morning Sort or Evening Pack",
          "Yes, since it's during the day",
          "No, minors cannot volunteer at all"
        ],
        "answer": 1
      },
      {
        "q": "A new volunteer who hasn't completed orientation wants to help with Wednesday's Client Intake Support. Is this allowed?",
        "options": [
          "Yes, orientation isn't required for any shift",
          "No, Client Intake Support requires completed orientation first",
          "Yes, as long as they're over 18",
          "No, that shift is full"
        ],
        "answer": 1
      },
      {
        "q": "Someone wants to volunteer on a weekday morning without needing a car or orientation. Which shift fits?",
        "options": [
          "Friday Delivery Driver Shift",
          "Monday or Wednesday Morning Sort",
          "Wednesday Client Intake Support",
          "Saturday Community Distribution"
        ],
        "answer": 1
      },
      {
        "q": "A volunteer needs to cancel their Saturday shift. How much notice should they give?",
        "options": [
          "No notice needed",
          "At least 24 hours in advance",
          "At least 48 hours in advance",
          "One week in advance"
        ],
        "answer": 1
      },
      {
        "q": "Someone wants to sign up for Monday's evening shift, but it's only 30 hours away. Is this possible?",
        "options": [
          "Yes, sign-ups are always open",
          "No, sign-ups close 48 hours before each shift",
          "Yes, but only online",
          "No, evening shifts require a week's notice"
        ],
        "answer": 1
      },
      {
        "q": "Which shift has the highest volunteer capacity?",
        "options": [
          "Monday Morning Sort, 8 volunteers",
          "Friday Delivery Driver, 4 volunteers",
          "Saturday Community Distribution Day, 15 volunteers",
          "Wednesday Client Intake, 3 volunteers"
        ],
        "answer": 2
      },
      {
        "q": "What physical requirement applies to the Saturday Community Distribution shift?",
        "options": [
          "No physical requirement",
          "Ability to lift 10 kg boxes",
          "A valid driver's license",
          "Standing for 8 hours straight"
        ],
        "answer": 1
      },
      {
        "q": "What must a volunteer have to sign up for the Delivery Driver shift?",
        "options": [
          "Their own vehicle insurance",
          "A valid driver's license",
          "A completed food safety course",
          "Nothing special is required"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-08",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Dry Cleaning and Tailoring Price List",
    "text": "Crestview Cleaners — Service & Price List\n\nDry Cleaning:\n- Shirt (laundered & pressed): $4.50\n- Suit (2-piece): $14.00\n- Dress (regular): $9.00\n- Dress (formal/beaded): $18.00\n- Coat/Jacket: $12.00\n\nAlterations:\n- Hem pants (no lining): $12.00 — Turnaround: 3 business days\n- Hem pants (lined): $18.00 — Turnaround: 5 business days\n- Take in waist: $15.00 — Turnaround: 4 business days\n- Replace zipper: $20.00 — Turnaround: 5 business days\n- Shorten sleeves: $16.00 — Turnaround: 4 business days\n\nExpress Service:\n- Available for dry cleaning only (not alterations), next-day turnaround for an additional 50% of item price\n- Must be dropped off before 10:00 AM to qualify for next-day pickup\n\nDiscounts:\n- 10% off any order over $50\n- Student/senior discount: 15% off dry cleaning only, valid ID required, cannot combine with the order-over-$50 discount\n- Wedding dress cleaning & preservation: flat $85, includes archival box, 2-week turnaround, no express option available\n\nNotes: All alterations require an in-person fitting at drop-off. Items not picked up within 60 days are donated to charity. The cleaners is closed Sundays and statutory holidays.",
    "questions": [
      {
        "q": "A student wants their dry cleaning done with next-day express service and also wants the student discount. What should they know about combining discounts?",
        "options": [
          "Both can always be combined freely",
          "The student discount cannot be combined with the order-over-$50 discount, though express service is separately available for dry cleaning",
          "Express service is never available for students",
          "Discounts don't apply to express orders at all"
        ],
        "answer": 1
      },
      {
        "q": "A non-student customer has a $60 dry cleaning order. Which discount applies?",
        "options": [
          "The student/senior discount",
          "The 10% off orders over $50",
          "Both discounts combined",
          "No discount applies"
        ],
        "answer": 1
      },
      {
        "q": "A customer needs lined pants hemmed by tomorrow. Is this possible?",
        "options": [
          "Yes, express alterations are available",
          "No, alterations don't have an express option, and lined hems take 5 business days",
          "Yes, for an extra rush fee",
          "No, hemming isn't offered at all"
        ],
        "answer": 1
      },
      {
        "q": "A customer drops off a formal beaded dress at 11:00 AM wanting next-day pickup. Do they qualify for express service?",
        "options": [
          "Yes, any drop-off time qualifies",
          "No, items must be dropped off before 10:00 AM to qualify",
          "Yes, formal dresses always get priority",
          "No, formal dresses are never eligible for express"
        ],
        "answer": 1
      },
      {
        "q": "What does the wedding dress preservation service include, and how long does it take?",
        "options": [
          "$85 flat fee, includes an archival box, 2-week turnaround",
          "$60, same-day service",
          "$120, 1-week turnaround with express option",
          "Free with any order over $50"
        ],
        "answer": 0
      },
      {
        "q": "What must customers do when dropping off items for alterations?",
        "options": [
          "Nothing extra is required",
          "Complete an in-person fitting at drop-off",
          "Pay in full immediately",
          "Provide a receipt from the original purchase"
        ],
        "answer": 1
      },
      {
        "q": "An item has been left uncollected for 70 days. What happens to it?",
        "options": [
          "It's returned to the customer automatically",
          "It is donated to charity",
          "It's destroyed",
          "It stays on the rack indefinitely"
        ],
        "answer": 1
      },
      {
        "q": "What is the cost and turnaround time for replacing a zipper?",
        "options": [
          "$12, 3 business days",
          "$20, 5 business days",
          "$15, 4 business days",
          "$18, 5 business days"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-09",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Downtown Parking Rate Schedule",
    "text": "Meridian Parkade — Downtown Parking Rates\n\nHourly Rates (Monday-Friday, 6:00 AM-6:00 PM):\n- First 30 minutes: Free\n- 30 min-1 hour: $3.00\n- Each additional hour: $2.50\n- Daily maximum (weekday): $22.00\n\nEvenings & Weekends (Mon-Fri after 6:00 PM; all day Sat-Sun):\n- Flat rate: $8.00, valid until 6:00 AM the following day\n\nMonthly Parking Pass:\n- Unreserved: $180/month — Reserved spot: $240/month — Both include 24/7 access and in/out privileges (may leave and re-enter unlimited times)\n\nEvent Parking:\n- Special flat rate of $15 applies during events at the adjacent Meridian Arena, in effect from 3 hours before to 1 hour after the listed event time, overriding all other rates during that window\n\nNotes: Lost ticket fee is $25, charged as the assumed maximum daily rate. Payment accepted by credit card or the Meridian app; no cash accepted as of this year. Monthly pass holders must tap their pass card at both entry and exit gates; failure to tap at exit results in a $10 gate-malfunction fee added to the next billing cycle.",
    "questions": [
      {
        "q": "Someone parks on a weekday from 9:00 AM to 1:00 PM (4 hours). What is the total cost?",
        "options": [
          "$8.00",
          "$10.50",
          "$12.50",
          "$22.00"
        ],
        "answer": 1
      },
      {
        "q": "The evening/weekend flat rate is valid until what time the next day?",
        "options": [
          "Midnight",
          "6:00 AM",
          "9:00 AM",
          "Noon"
        ],
        "answer": 1
      },
      {
        "q": "Someone is attending a 7:00 PM event at Meridian Arena. During what window does the special event parking rate apply?",
        "options": [
          "All day",
          "4:00 PM to 8:00 PM",
          "6:00 PM to 6:00 AM",
          "7:00 PM to 9:00 PM only"
        ],
        "answer": 1
      },
      {
        "q": "A reserved monthly pass holder forgets to tap their card at the exit gate. What happens?",
        "options": [
          "Nothing, it's optional",
          "A $10 gate-malfunction fee is added to the next bill",
          "Their pass is cancelled",
          "They must pay the daily maximum"
        ],
        "answer": 1
      },
      {
        "q": "What is charged if someone loses their parking ticket?",
        "options": [
          "$10",
          "$15",
          "$25, the assumed maximum daily rate",
          "No charge"
        ],
        "answer": 2
      },
      {
        "q": "Can a driver pay for parking with cash?",
        "options": [
          "Yes, cash is preferred",
          "No, only credit card or the Meridian app are accepted",
          "Yes, but only for monthly passes",
          "Cash is accepted only on weekends"
        ],
        "answer": 1
      },
      {
        "q": "What is the cost difference between a reserved and an unreserved monthly pass?",
        "options": [
          "$30",
          "$60",
          "$90",
          "$120"
        ],
        "answer": 1
      },
      {
        "q": "A monthly pass holder leaves for lunch and returns later the same day. Is this allowed without extra charge?",
        "options": [
          "No, re-entry always costs extra",
          "Yes, monthly passes include unlimited in/out privileges",
          "Only on weekends",
          "Only if they tap out within 30 minutes"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-10",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Moving Company Service Packages",
    "text": "Steadfast Movers — Local Moving Package Options\n\nBasic Package:\n- 2 movers, truck included — $110/hour (2-hour minimum) — Loading & unloading only, customer packs all boxes themselves\n\nStandard Package:\n- 3 movers, truck included — $145/hour (2-hour minimum) — Loading, unloading, and furniture disassembly/reassembly for beds and tables\n\nFull-Service Package:\n- 4 movers, truck included — $190/hour (3-hour minimum) — Includes packing materials and full packing service, furniture disassembly/reassembly, and appliance disconnection (not reconnection of gas appliances, which requires a licensed technician)\n\nAdd-ons (any package):\n- Extra mover: $35/hour\n- Piano or safe moving: flat $150 additional\n- Packing materials only (no packing service): $60 flat fee for a standard supply kit (boxes, tape, paper)\n- Travel fee: $1/km beyond a 20 km radius from the company's depot\n\nNotes: A 15% gratuity is customary but not included in quoted prices. Cancellations made less than 48 hours before the scheduled move incur a $75 cancellation fee. All packages require a credit card hold at booking; the final charge is based on actual time used, rounded up to the nearest 15 minutes. Full-Service bookings must be made at least 5 days in advance due to the packing materials order.",
    "questions": [
      {
        "q": "A customer needs help moving a piano and wants full packing service included. Which package and add-on apply, and what is the minimum booking time?",
        "options": [
          "Standard Package plus piano add-on, 2-hour minimum",
          "Full-Service Package plus $150 piano add-on, 3-hour minimum",
          "Basic Package plus piano add-on, 2-hour minimum",
          "Full-Service Package only, no add-on needed for the piano"
        ],
        "answer": 1
      },
      {
        "q": "A customer books the Basic Package but wants one extra mover. What is the new hourly rate?",
        "options": [
          "$110/hour",
          "$145/hour",
          "$180/hour",
          "$35/hour"
        ],
        "answer": 1
      },
      {
        "q": "A customer cancels their move 30 hours before the scheduled time. What fee applies?",
        "options": [
          "No fee, since it's more than 24 hours notice",
          "$75 cancellation fee",
          "$110, one hour of service",
          "Half the total quoted price"
        ],
        "answer": 1
      },
      {
        "q": "A family needs their bed and table disassembled but will pack their own boxes. Which package best fits their needs?",
        "options": [
          "Basic Package, since it's cheapest",
          "Standard Package, which includes disassembly but not packing service",
          "Full-Service Package, since it includes everything",
          "None of the packages include disassembly"
        ],
        "answer": 1
      },
      {
        "q": "A customer lives 35 km from the company's depot. What extra travel charge applies?",
        "options": [
          "No extra charge",
          "$15, for 15 km beyond the 20 km radius",
          "$35, for the full distance",
          "$20 flat travel fee"
        ],
        "answer": 1
      },
      {
        "q": "How is the final charge for a move calculated regarding time?",
        "options": [
          "A flat daily rate regardless of hours used",
          "Actual time used, rounded up to the nearest 15 minutes",
          "Estimated time only, no adjustments",
          "Billed in full-hour increments only"
        ],
        "answer": 1
      },
      {
        "q": "A customer wants to book the Full-Service Package with only 3 days' notice. Is this possible?",
        "options": [
          "Yes, any package can be booked last-minute",
          "No, Full-Service requires at least 5 days' notice due to packing materials orders",
          "Yes, but with a rush fee",
          "No, Full-Service isn't available on short notice under any circumstances, even with more notice"
        ],
        "answer": 1
      },
      {
        "q": "Is gratuity included in the quoted prices?",
        "options": [
          "Yes, 15% is built into every quote",
          "No, a 15% gratuity is customary but charged separately",
          "Gratuity is optional and never expected",
          "Yes, but only for Full-Service bookings"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-11",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Adult Continuing Education Course Fee Schedule",
    "text": "Fairmont Continuing Education — Fall Course Fee Schedule\n\nLanguage Courses:\n- Spanish for Beginners (10 weeks, 1x/week, 2 hrs) — $180 — Materials fee $25 extra\n- Conversational French (8 weeks, 1x/week, 1.5 hrs) — $140 — Materials included\n\nComputer Skills:\n- Intro to Excel (6 weeks, 1x/week, 2 hrs) — $150 — Laptop provided in class\n- Web Design Basics (10 weeks, 2x/week, 2 hrs each) — $310 — Own laptop required\n\nArts & Hobbies:\n- Watercolour Painting (8 weeks, 1x/week, 2.5 hrs) — $165 — Materials fee $40 extra\n- Pottery Wheel Basics (6 weeks, 1x/week, 3 hrs) — $220 — Materials/firing fee included, class limited to 8 students\n\nDiscounts:\n- Early registration (3+ weeks before start date): 10% off course fee (not materials fees)\n- Seniors (65+): 20% off course fee; cannot be combined with the early registration discount\n- Register for 2+ courses in the same term: $15 off the total, combinable with other discounts\n\nNotes: A minimum of 6 students must enrol for a course to run; if a course is cancelled due to low enrolment, students are notified at least 5 days before the start date and given a full refund or transfer credit. Pottery Wheel Basics frequently reaches its 8-student cap and fills on a first-come, first-served basis with no waitlist.",
    "questions": [
      {
        "q": "A senior citizen registers for Spanish for Beginners four weeks before the start date. Which discount applies, and can they combine it with another?",
        "options": [
          "Only the early registration discount, 10% off",
          "Only the senior discount, 20% off, which cannot be combined with early registration",
          "Both discounts combined, for 30% off",
          "Neither discount applies to language courses"
        ],
        "answer": 1
      },
      {
        "q": "Someone registers for both Intro to Excel and Conversational French in the same term. What discount do they receive?",
        "options": [
          "10% off both courses",
          "$15 off the total, combinable with other discounts",
          "A free materials kit",
          "No discount for multiple courses"
        ],
        "answer": 1
      },
      {
        "q": "Does the Pottery Wheel Basics fee change based on materials used?",
        "options": [
          "Yes, materials are billed separately",
          "No, materials and firing fees are included in the flat $220 price",
          "Yes, an extra $40 always applies",
          "It depends on the project size"
        ],
        "answer": 1
      },
      {
        "q": "What happens if a course doesn't reach the minimum enrolment of 6 students?",
        "options": [
          "It runs anyway with a surcharge",
          "It is cancelled, and students are notified at least 5 days before start with a refund or transfer credit",
          "Students must find their own replacements",
          "The course is postponed by one week automatically"
        ],
        "answer": 1
      },
      {
        "q": "Which course fills quickly and has no waitlist once full?",
        "options": [
          "Watercolour Painting",
          "Web Design Basics",
          "Pottery Wheel Basics, capped at 8 students",
          "Conversational French"
        ],
        "answer": 2
      },
      {
        "q": "Which computer course requires students to bring their own laptop?",
        "options": [
          "Intro to Excel",
          "Web Design Basics",
          "Both computer courses require one",
          "Neither course requires one"
        ],
        "answer": 1
      },
      {
        "q": "What is the total cost of Watercolour Painting including its materials fee?",
        "options": [
          "$165",
          "$180",
          "$205",
          "$220"
        ],
        "answer": 2
      },
      {
        "q": "Does the early registration discount apply to materials fees?",
        "options": [
          "Yes, to everything",
          "No, it only applies to the course fee, not materials fees",
          "Only for arts courses",
          "Only if combined with the senior discount"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "R2-12",
    "partNum": 2,
    "part": "Part 2: Reading to Apply a Diagram",
    "title": "Swim Lesson Levels and Schedule",
    "text": "Bluewave Aquatics — Fall Swim Lesson Levels & Schedule\n\nParent & Tot (ages 6 months-3 years, parent in water):\n- Saturdays 9:00-9:30 AM — Pool B — $95/8-week session\n\nPreschool Level 1 (ages 3-5, no floating ability required):\n- Tuesdays 4:00-4:30 PM or Saturdays 9:45-10:15 AM — Pool B — $95/8-week session\n\nPreschool Level 2 (ages 3-5, must float unassisted for 5 seconds):\n- Thursdays 4:00-4:30 PM — Pool B — $95/8-week session\n\nSwimmer Level 1 (ages 6-12, beginner, no prerequisite):\n- Mondays 5:00-5:45 PM or Wednesdays 5:00-5:45 PM — Pool A — $110/8-week session\n\nSwimmer Level 3 (ages 6-12, must complete Level 2 or pass equivalency test):\n- Mondays 6:00-6:45 PM — Pool A — $110/8-week session\n\nAdult Lessons (ages 16+, all levels welcome):\n- Sundays 11:00 AM-12:00 PM — Pool A — $130/8-week session\n\nNotes: Children moving up from Preschool Level 1 must be evaluated by an instructor before enrolling in Level 2; evaluations happen during the last class of each session, or by appointment for $20. Registration for returning students opens one week before general registration opens to the public. All levels require a swimsuit and are non-refundable after the second class of the session, though credit toward a future session is available with a doctor's note.",
    "questions": [
      {
        "q": "A parent's 4-year-old cannot float unassisted yet. Which level and scheduling options fit?",
        "options": [
          "Preschool Level 2, Thursdays only",
          "Preschool Level 1, Tuesdays 4:00 PM or Saturdays 9:45 AM",
          "Swimmer Level 1, Mondays or Wednesdays",
          "Parent & Tot, Saturdays 9:00 AM"
        ],
        "answer": 1
      },
      {
        "q": "A child wants to move up to Preschool Level 2, but the session already ended without an evaluation. What are their options?",
        "options": [
          "They cannot move up until next year",
          "Wait for an evaluation during the last class of a session, or pay $20 for an appointment evaluation",
          "Automatic promotion is guaranteed",
          "Ask a parent to evaluate them at home"
        ],
        "answer": 1
      },
      {
        "q": "An adult who has never swum before wants lessons. What should they know about the Adult Lessons option?",
        "options": [
          "It's only for advanced swimmers",
          "All levels are welcome in the single Sunday session",
          "They must take Swimmer Level 1 first",
          "Adults are not offered lessons"
        ],
        "answer": 1
      },
      {
        "q": "A family wants to enrol their 8-year-old directly in Swimmer Level 3 without having taken Level 2. Is this allowed?",
        "options": [
          "Yes, with no conditions",
          "Only if the child passes an equivalency test",
          "No, it's never allowed",
          "Yes, if a parent signs a waiver"
        ],
        "answer": 1
      },
      {
        "q": "How much earlier can returning students register compared to the general public?",
        "options": [
          "No earlier, registration opens the same day for everyone",
          "One week earlier",
          "One month earlier",
          "Two days earlier"
        ],
        "answer": 1
      },
      {
        "q": "A swimmer withdraws after their third class due to injury. What can they expect?",
        "options": [
          "A full refund automatically",
          "No refund, but possible credit toward a future session with a doctor's note",
          "A partial refund of 50%",
          "Nothing, they lose their spot with no options"
        ],
        "answer": 1
      },
      {
        "q": "What is the price difference between Parent & Tot and Adult Lessons sessions?",
        "options": [
          "$15",
          "$35",
          "$50",
          "No difference, both cost the same"
        ],
        "answer": 1
      },
      {
        "q": "What is required for a child to be eligible for Preschool Level 2?",
        "options": [
          "Completion of a written test",
          "Ability to float unassisted for 5 seconds",
          "Being at least 5 years old",
          "Parent must be in the water"
        ],
        "answer": 1
      }
    ]
  }
];
