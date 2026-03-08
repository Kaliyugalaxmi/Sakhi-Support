const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");

const MONGODB_URI = "mongodb://127.0.0.1:27017/sakhi-support";

const sampleSchemes = [
  {
    schemeId: "PMM_001",
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    category: "Health",
    lifeStage: ["pregnant", "mother"],
    state: "All India",
    icon: "🤰",
    benefit: "₹5,000 in 3 installments",
    eligibility: [
      "Pregnant women and lactating mothers",
      "First live birth of the family",
      "Age 19 years or above",
      "Registered at Anganwadi or approved health facility",
    ],
    eligibilityQuestions: [
      {
        id: "q1",
        question: "Is this your first pregnancy?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "This scheme is only for the first live birth in a family",
        weight: 3,
      },
      {
        id: "q2",
        question: "What is your current age?",
        type: "age_range",
        required: true,
        eligibilityCriteria: { min: 19, max: null },
        helpText: "You must be 19 years or older to be eligible",
        weight: 3,
      },
      {
        id: "q3",
        question: "Are you registered at an Anganwadi center or approved health facility?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "Registration is mandatory for receiving benefits",
        weight: 2,
      },
      {
        id: "q4",
        question: "Do you have a bank account linked to Aadhaar?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "DBT (Direct Benefit Transfer) requires Aadhaar-linked bank account",
        weight: 2,
      },
    ],
    documents: ["Aadhaar Card", "Bank Account Passbook", "MCP Card", "Identity Proof"],
    description: "PMMVY provides cash incentive to pregnant women and lactating mothers for the first live birth to meet the increased nutritional needs and partially compensate for wage loss.",
    howToApply: "Visit your nearest Anganwadi Center or Health Sub-Centre with required documents. Fill Form 1-A within 150 days of pregnancy. Submit Form 1-B after 6 months of pregnancy. Submit Form 1-C after child birth.",
    website: "https://pmmvy.wcd.gov.in",
    status: "active",
    minimumEligibilityScore: 80,
  },
  {
    schemeId: "WIDOW_PENSION_001",
    name: "National Widow Pension Scheme",
    category: "Finance",
    lifeStage: ["widow"],
    state: "All India",
    icon: "🕊️",
    benefit: "₹300-₹500 per month",
    eligibility: [
      "Widowed woman",
      "Age between 40-64 years",
      "Below Poverty Line (BPL)",
      "No regular source of income",
    ],
    eligibilityQuestions: [
      {
        id: "q1",
        question: "What is your current age?",
        type: "age_range",
        required: true,
        eligibilityCriteria: { min: 40, max: 64 },
        helpText: "This scheme is for widows between 40-64 years of age",
        weight: 3,
      },
      {
        id: "q2",
        question: "Do you have a BPL (Below Poverty Line) card?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "BPL status is mandatory for this pension scheme",
        weight: 3,
      },
      {
        id: "q3",
        question: "What is your monthly household income?",
        type: "income_range",
        required: true,
        eligibilityCriteria: { min: null, max: 10000 },
        helpText: "Monthly household income should be below ₹10,000",
        weight: 2,
      },
      {
        id: "q4",
        question: "Do you currently receive any other government pension?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "no",
        helpText: "You cannot receive multiple pensions simultaneously",
        weight: 2,
      },
    ],
    documents: ["Widow Certificate", "BPL Card", "Aadhaar Card", "Bank Account Details", "Age Proof"],
    description: "The National Widow Pension Scheme provides financial assistance to widows living below the poverty line to help them meet their basic needs.",
    howToApply: "Apply online through your state's social welfare department portal or visit the nearest Block Development Office with required documents.",
    website: "Varies by state",
    status: "active",
    minimumEligibilityScore: 70,
  },
  {
    schemeId: "BBBP_001",
    name: "Beti Bachao Beti Padhao",
    category: "Education",
    lifeStage: ["all", "unmarried", "young"],
    state: "All India",
    icon: "👧",
    benefit: "Financial support for girl child education",
    eligibility: [
      "Girl child under 10 years",
      "Indian citizen",
      "Birth registered within one year",
      "Account opened in post office or bank",
    ],
    eligibilityQuestions: [
      {
        id: "q1",
        question: "What is the age of the girl child?",
        type: "age_range",
        required: true,
        eligibilityCriteria: { min: 0, max: 10 },
        helpText: "The account must be opened before the girl child turns 10",
        weight: 3,
      },
      {
        id: "q2",
        question: "Was the birth registered within one year of birth?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "Birth registration is mandatory",
        weight: 2,
      },
      {
        id: "q3",
        question: "Do you have an account in post office or authorized bank?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "Sukanya Samriddhi Account is required",
        weight: 3,
      },
      {
        id: "q4",
        question: "Is the girl child an Indian citizen?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "Only Indian citizens are eligible",
        weight: 2,
      },
    ],
    documents: ["Birth Certificate", "Identity Proof (Parents)", "Address Proof", "Passport Size Photos"],
    description: "Beti Bachao Beti Padhao is a government scheme aimed at generating awareness and improving the efficiency of welfare services for girls in India.",
    howToApply: "Open a Sukanya Samriddhi Account at any post office or authorized bank with the required documents and minimum deposit.",
    website: "https://wcd.nic.in/bbbp-schemes",
    status: "active",
    minimumEligibilityScore: 75,
  },
  {
    schemeId: "PMAY_001",
    name: "Pradhan Mantri Awas Yojana (Women)",
    category: "Housing",
    lifeStage: ["all", "married", "widow", "mother"],
    state: "All India",
    icon: "🏠",
    benefit: "Subsidy up to ₹2.67 lakh for home loan",
    eligibility: [
      "Woman should be co-owner or sole owner",
      "No pucca house in family member's name",
      "Not availed any housing scheme before",
      "Annual income within limits",
    ],
    eligibilityQuestions: [
      {
        id: "q1",
        question: "What is your annual household income?",
        type: "income_range",
        required: true,
        eligibilityCriteria: { min: null, max: 1800000 },
        helpText: "Annual income should be below ₹18 lakhs for eligibility",
        weight: 3,
      },
      {
        id: "q2",
        question: "Do you or any family member own a pucca house?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "no",
        helpText: "You should not own any pucca house anywhere in India",
        weight: 3,
      },
      {
        id: "q3",
        question: "Will the property be in your name or co-owned?",
        type: "select",
        required: true,
        options: ["Sole ownership", "Co-ownership with husband", "Co-ownership with family", "Not applicable"],
        eligibilityCriteria: ["Sole ownership", "Co-ownership with husband", "Co-ownership with family"],
        helpText: "Woman must be owner or co-owner of the property",
        weight: 2,
      },
      {
        id: "q4",
        question: "Have you availed any other housing scheme before?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "no",
        helpText: "You should not have benefited from any central or state housing scheme",
        weight: 2,
      },
    ],
    documents: ["Aadhaar Card", "Income Certificate", "Property Documents", "Bank Statements", "Caste Certificate (if applicable)"],
    description: "PMAY provides interest subsidy on home loans for economically weaker sections and low-income groups, with mandatory woman ownership or co-ownership.",
    howToApply: "Apply through authorized banks and financial institutions offering home loans under PMAY. Visit the official website to check eligible lenders.",
    website: "https://pmaymis.gov.in",
    status: "active",
    minimumEligibilityScore: 70,
  },
  {
    schemeId: "NRLM_001",
    name: "National Rural Livelihood Mission (Women SHGs)",
    category: "Skill Development",
    lifeStage: ["all", "married", "mother", "widow", "single"],
    state: "All India",
    icon: "👥",
    benefit: "SHG formation, skill training, credit linkage, market access",
    eligibility: [
      "Rural women",
      "Willing to form or join Self Help Group",
      "Age 18-60 years",
      "Ready to undergo skill training",
    ],
    eligibilityQuestions: [
      {
        id: "q1",
        question: "Do you live in a rural area?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "This scheme is specifically for rural women",
        weight: 3,
      },
      {
        id: "q2",
        question: "What is your age?",
        type: "age_range",
        required: true,
        eligibilityCriteria: { min: 18, max: 60 },
        helpText: "You must be between 18-60 years old",
        weight: 2,
      },
      {
        id: "q3",
        question: "Are you willing to join or form a Self Help Group (10-15 women)?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "SHG participation is mandatory for this scheme",
        weight: 3,
      },
      {
        id: "q4",
        question: "Are you willing to undergo skill development training?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "Skill training is an integral part of the program",
        weight: 2,
      },
    ],
    documents: ["Aadhaar Card", "Residence Proof (Rural)", "BPL Card (if applicable)", "Bank Account Details"],
    description: "NRLM organizes rural women into Self Help Groups for skill training, credit linkage, and economic empowerment through collective action.",
    howToApply: "Contact your nearest Block Resource Person or visit the District Mission Management Unit. You can also register through state rural livelihood mission websites.",
    website: "https://nrlm.gov.in",
    status: "active",
    minimumEligibilityScore: 75,
  },
  {
    schemeId: "LEGAL_AID_001",
    name: "Free Legal Aid to Women",
    category: "Legal",
    lifeStage: ["all"],
    state: "All India",
    icon: "⚖️",
    benefit: "Free legal services & representation",
    eligibility: [
      "All women regardless of income",
      "Victims of trafficking",
      "Under legal proceedings",
      "Indian citizen or resident",
    ],
    eligibilityQuestions: [
      {
        id: "q1",
        question: "Are you involved in any legal proceedings or need legal consultation?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "This service is for women requiring legal assistance",
        weight: 2,
      },
      {
        id: "q2",
        question: "What type of legal assistance do you need?",
        type: "select",
        required: true,
        options: [
          "Domestic violence case",
          "Divorce/Matrimonial dispute",
          "Property rights",
          "Criminal case victim",
          "Maintenance/Alimony",
          "Other civil/criminal matter",
        ],
        eligibilityCriteria: [
          "Domestic violence case",
          "Divorce/Matrimonial dispute",
          "Property rights",
          "Criminal case victim",
          "Maintenance/Alimony",
          "Other civil/criminal matter",
        ],
        helpText: "Select the legal matter you need help with",
        weight: 1,
      },
      {
        id: "q3",
        question: "Are you able to afford a private lawyer?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "no",
        helpText: "Free legal aid is prioritized for those who cannot afford private representation",
        weight: 2,
      },
      {
        id: "q4",
        question: "Are you an Indian citizen or permanent resident?",
        type: "yes_no",
        required: true,
        eligibilityCriteria: "yes",
        helpText: "Must be Indian citizen or permanent resident",
        weight: 3,
      },
    ],
    documents: ["Identity Proof", "Income Certificate (if applicable)", "Legal Documents", "Address Proof"],
    description: "Free legal advice, drafting of documents, and representation in court for eligible women through National Legal Services Authority (NALSA).",
    howToApply: "Visit your nearest District Legal Services Authority office or State Legal Services Authority. Call NALSA helpline 15100 for guidance.",
    website: "https://nalsa.gov.in",
    status: "active",
    minimumEligibilityScore: 65,
  },
];

async function seedDatabase() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️  Clearing existing schemes...");
    await Scheme.deleteMany({});
    console.log("✅ Existing schemes cleared");

    console.log("📝 Inserting sample schemes with eligibility questions...");
    const inserted = await Scheme.insertMany(sampleSchemes);
    console.log(`✅ Successfully inserted ${inserted.length} schemes`);

    console.log("\n📊 Sample Schemes Added:");
    inserted.forEach((scheme, index) => {
      console.log(`\n${index + 1}. ${scheme.name}`);
      console.log(`   Category: ${scheme.category}`);
      console.log(`   Life Stages: ${scheme.lifeStage.join(", ")}`);
      console.log(`   Eligibility Questions: ${scheme.eligibilityQuestions.length}`);
      console.log(`   Minimum Score Required: ${scheme.minimumEligibilityScore}%`);
    });

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n💡 You can now:");
    console.log("   1. Visit http://localhost:5173/dashboard and go to Schemes");
    console.log("   2. Click 'Check Eligibility' on any scheme");
    console.log("   3. Answer the questions to see if you're eligible");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the seeder
seedDatabase();