import { getDateStamp } from "@/lib/utils";

interface CandidateResult {
    name: string;
    folderName: string;
    content: string;
}

export function buildArenaPrompt(candidates: CandidateResult[], requirements?: string | null): string {
    const candidateReports = candidates
        .map(
            (c, i) => `
## Candidate ${i + 1}: ${c.name}

${c.content}

---
`
        )
        .join("\n");

    const requirementsSection = requirements
        ? `
## Job Requirements
The following are the specific requirements for this position. Use these to evaluate and rank candidates:

${requirements}

---
`
        : "";

    return `You are a senior hiring manager and talent acquisition specialist. Your task is to analyze multiple candidate background check reports and create a comprehensive ranking/decision matrix.${requirements ? " Evaluate all candidates against the provided job requirements." : ""}
${requirementsSection}
## Candidates to Evaluate

${candidateReports}

## Your Analysis Tasks:

### 1. Role Identification & Grouping
First, analyze each candidate's background check report to identify:
- What role(s) they are applying for or best suited for (based on their experience, skills, and career trajectory)
- Group candidates by their identified roles
- If a candidate could fit multiple roles, note this

### 2. Individual Assessment Summary
For each candidate, extract and summarize:
- Identified role/position
- Overall rating from their report
- Realness/Legitimacy score
- Key strengths
- Key concerns/red flags
- Verification status (well-verified vs. unverifiable claims)

### 3. Per-Role Decision Matrix
For each identified role, create a separate decision matrix comparing only the candidates for that role.

### 4. Per-Role Ranking
Provide a ranked list within each role group with justification.

## Required Output Format (Markdown):

# Candidate Arena: Comparative Analysis

## Analysis Date: ${getDateStamp()}
## Total Candidates Evaluated: ${candidates.length}

---

## 🏷️ Candidates by Role

List all identified roles and which candidates belong to each.

---

## 📊 Decision Matrix by Role

For EACH identified role, create a section:

### Role: [Role Name]

#### Candidates for this role:
| Candidate | Overall Score | Legitimacy | Verification Strength | Red Flags | Recommendation |
|-----------|---------------|------------|----------------------|-----------|----------------|
| ... | X/10 | X/100 | High/Medium/Low | Count | ✅/⚠️/❌ |

#### Ranking for [Role Name]:
1. **[Name]** - Score X/10, Legitimacy X/100
   - Why they rank here: ...
   - Concerns: ...

(Repeat for each role...)

---

## 📈 Cross-Role Insights

### Verification Strength Comparison
Which candidates have the most verifiable work history across all roles?

### Red Flags Summary
| Candidate | Role | Red Flag | Severity | Impact |
|-----------|------|----------|----------|--------|
| ... | ... | ... | High/Medium/Low | ... |

---
${requirements ? `
## 🎯 Requirements Match Matrix

Evaluate each candidate against the job requirements:

| Candidate | Requirement 1 | Requirement 2 | ... | Overall Fit |
|-----------|---------------|---------------|-----|-------------|
| ... | ✅/⚠️/❌ | ✅/⚠️/❌ | ... | X/10 |

### Requirements Fit Ranking
Rank candidates by how well they match the specific job requirements:
1. **[Name]** - Fit Score: X/10 - [Brief justification]

---
` : ""}
## 🎯 Hiring Recommendations by Role

For EACH role:

### [Role Name]
- **Strongly Recommend**: [Names]
- **Recommend with Reservations**: [Names]
- **Do Not Recommend**: [Names]

---

## 📋 Next Steps for Top Candidates

For each recommended candidate, list specific verification steps:
1. [Candidate Name] ([Role]): [Specific action items]

---

*Arena analysis generated on ${getDateStamp()}*
*This comparative analysis should be used alongside other hiring inputs and processes.*

---

Now analyze all the candidate reports provided above, identify their roles, group them accordingly, and generate the complete comparative arena analysis with per-role decision matrices.`;
}
