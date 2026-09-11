/**
 * Goal-Based Discovery Configuration — YojanaSetu (PS16)
 *
 * Mappings between citizen-facing support goals and the verified 20 schemes.
 * Categorization is derived from the official scheme database:
 * - Scheme categories in CSV/DB: Education, Skill Development, Health and Wellness,
 *   Maternity and Nutrition, Food Security, Insurance, Disability and Social Welfare,
 *   Pension and Social Security, Agriculture and Crop Insurance, Agriculture and Income Support,
 *   Housing, Energy and Household Welfare, Artisans and Craftspeople, Microenterprise Credit,
 *   Social Security, Employment and Internship.
 */

export const SUPPORT_GOALS = [
  {
    id: "education",
    title: "Education",
    icon: "🎓",
    description: "Find scholarships and education support",
    categories: ["Education"],
    schemes: [
      "Prime Minister's Scholarship Scheme",
      "Educational Assistance to the 10th to 12th Students",
      "National Means-Cum-Merit Scholarship Scheme",
    ],
  },
  {
    id: "employment",
    title: "Employment",
    icon: "💼",
    description: "Find employment and livelihood support",
    categories: ["Employment and Internship", "Skill Development"],
    schemes: [
      "Prime Minister’s Internship Scheme",
      "Prime Minister's Internship Scheme",
      "Craftsman Training Scheme - Maharashtra",
      "Pradhan Mantri Kaushal Vikas Yojana - Short Term Training",
      "PM-DAKSH",
    ],
  },
  {
    id: "healthcare",
    title: "Healthcare",
    icon: "🏥",
    description: "Find health coverage and maternity support",
    categories: ["Health and Wellness", "Maternity and Nutrition", "Insurance"],
    schemes: [
      "Ayushman Bharat - PM-JAY",
      "Pradhan Mantri Matru Vandana Yojana",
      "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    ],
  },
  {
    id: "skill_development",
    title: "Skill Development",
    icon: "🛠️",
    description: "Find vocational and practical skill training",
    categories: ["Skill Development", "Skill Development and Social Empowerment"],
    schemes: [
      "Craftsman Training Scheme - Maharashtra",
      "Pradhan Mantri Kaushal Vikas Yojana - Short Term Training",
      "PM-DAKSH",
      "PM Vishwakarma",
    ],
  },
  {
    id: "housing",
    title: "Housing",
    icon: "🏠",
    description: "Find housing and essential household amenities",
    categories: ["Housing", "Energy and Household Welfare"],
    schemes: [
      "Pradhan Mantri Awas Yojana - Urban",
      "Pradhan Mantri Ujjwala Yojana 2.0",
    ],
  },
  {
    id: "agriculture",
    title: "Agriculture",
    icon: "🌾",
    description: "Find farming and agricultural support",
    categories: ["Agriculture and Crop Insurance", "Agriculture and Income Support"],
    schemes: [
      "Pradhan Mantri Kisan Samman Nidhi",
      "Pradhan Mantri Fasal Bima Yojana",
    ],
  },
  {
    id: "business",
    title: "Business",
    icon: "📈",
    description: "Find microenterprise credit and artisan tools",
    categories: ["Microenterprise Credit", "Artisans and Craftspeople"],
    schemes: [
      "Pradhan Mantri Mudra Yojana",
      "PM Vishwakarma",
    ],
  },
  {
    id: "food_security",
    title: "Food Security",
    icon: "🍲",
    description: "Find subsidized food grains and ration benefits",
    categories: ["Food Security"],
    schemes: [
      "Pradhan Mantri Garib Kalyan Anna Yojana",
    ],
  },
  {
    id: "pension",
    title: "Pension",
    icon: "🛡️",
    description: "Find pension schemes and social security",
    categories: ["Pension and Social Security", "Social Security"],
    schemes: [
      "Atal Pension Yojana",
      "National Family Benefit Scheme",
    ],
  },
  {
    id: "disability_support",
    title: "Disability Support",
    icon: "♿",
    description: "Find support programs for persons with disabilities",
    categories: ["Disability and Social Welfare"],
    schemes: [
      "Homes For Intellectually Impaired Persons",
    ],
  },
];

/**
 * Check if a scheme matches the selected goal IDs.
 * Matches on scheme name or category.
 */
export function matchesGoals(scheme, selectedGoalIds = []) {
  if (!selectedGoalIds || selectedGoalIds.length === 0) return true;
  
  const schemeName = (scheme.scheme_name || scheme.name || "").toLowerCase();
  const schemeCategory = (scheme.category || "").toLowerCase();

  return selectedGoalIds.some((goalId) => {
    const goal = SUPPORT_GOALS.find((g) => g.id === goalId);
    if (!goal) return false;

    // Check scheme name match
    const nameMatch = goal.schemes.some((s) =>
      schemeName.includes(s.toLowerCase()) || s.toLowerCase().includes(schemeName)
    );
    if (nameMatch) return true;

    // Check category match
    const categoryMatch = goal.categories.some((c) =>
      schemeCategory.includes(c.toLowerCase()) || c.toLowerCase().includes(schemeCategory)
    );
    return categoryMatch;
  });
}
