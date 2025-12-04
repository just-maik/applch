import { getDateStamp } from "@/lib/utils";

export function buildBackgroundCheckPrompt(applicantName: string, fileNames: string[], requirements?: string | null): string {
    const requirementsSection = requirements
        ? `
## Job Requirements
The following are the specific requirements for this position. Please evaluate the candidate against these requirements as part of your analysis:

${requirements}

---
`
        : "";

    return `You are a professional background verification specialist. Your task is to thoroughly analyze the provided resume/CV documents and conduct a comprehensive background check on this job applicant.${requirements ? " Additionally, evaluate how well the candidate matches the provided job requirements." : ""}

## Applicant: ${applicantName}
## Documents provided: ${fileNames.join(", ")}
${requirementsSection}

## Your Analysis Tasks:

### 1. Company Verification
For each company mentioned in the resume:
- Verify if the company exists and is legitimate
- Check if it's an established business (founding date, size, reputation)
- Look for any red flags (shell companies, recently created, no online presence)
- Assess if company ratings/reviews are available and what they indicate

### 2. Project & Portfolio Link Verification
For any project links, portfolio URLs, or GitHub profiles mentioned:
- Check if the links are still active and accessible
- Assess the scale/size of the projects (stars, forks, contributors for GitHub)
- Verify if the work shown matches the claimed expertise

### 3. Technology & Company Alignment
- Verify if the listed technologies align with what the companies they worked at typically use
- Check for any mismatches that seem suspicious (e.g., claiming to use technologies a company doesn't work with)
- Assess if the skill progression makes sense chronologically

### 4. General Credibility Assessment
- Look for any inconsistencies in dates, roles, or claims
- Check for any unrealistic claims or exaggerations
- Identify any information that cannot be verified

## Required Output Format (Markdown):

# Background Check Report: [Applicant Name]

## Overall Rating: [X/10]
Brief explanation of the rating.

## Realness/Legitimacy Score: [X/100]
- 90-100: Highly verified, all claims check out
- 70-89: Mostly verified, minor unverifiable claims
- 50-69: Partially verified, some concerns
- 30-49: Many unverifiable claims, significant concerns
- 0-29: Likely fake or heavily fabricated

- 40-0 is flagged a bullshit application

## Company Verification Results
| Company | Status | Established | Rating/Reputation | Notes |
|---------|--------|-------------|-------------------|-------|
| ... | ✅/⚠️/❌ | ... | ... | ... |

## Project/Link Verification
| Project/Link | Status | Scale/Activity | Notes |
|--------------|--------|----------------|-------|
| ... | ✅/⚠️/❌ | ... | ... |

## Technology Alignment Analysis
Assessment of whether the claimed technologies match the companies and roles.

## 🚨 Suspicious Items / Red Flags
List any concerning findings that warrant further investigation.

## ✅ Verified / Positive Indicators
List verified claims and positive findings.

## 📋 Unverifiable Claims
List items that could not be verified but aren't necessarily suspicious.
${requirements ? `
## 🎯 Requirements Match Assessment
Evaluate how well the candidate matches the job requirements:
| Requirement | Match Status | Evidence | Notes |
|-------------|--------------|----------|-------|
| ... | ✅/⚠️/❌ | ... | ... |

### Overall Requirements Fit: [X/10]
Brief assessment of how well the candidate meets the specified requirements.
` : ""}
## Final Recommendation
Brief recommendation on whether this appears to be a legitimate candidate worth interviewing.

---
*Report generated on ${getDateStamp()}*
*Note: This report is based on publicly available information and should be used as one input among many in the hiring process.*

---

Now analyze the provided documents and generate the complete background check report.`;
}
