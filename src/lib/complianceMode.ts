export const COMPLIANCE_MODE = {
  contentHubHomepage: true,
  externalJobsOnly: true,
  employerJobPosting: false,
  internalApplications: false,
  candidateDirectory: false,
  candidatePublishing: false,
  cvServices: false,
  communityJobSubmissions: false,
  commercialAds: false
} as const;

export type ComplianceMode = typeof COMPLIANCE_MODE;
