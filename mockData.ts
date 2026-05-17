export const SAMPLE_INQUIRIES = [
  "Need 1000 stainless steel tubes for oil refinery use",
  "We need a modern replacement for our legacy ERP system",
  "Need a prototype demo for industrial product visualization",
  "We want a VR training simulation for workforce onboarding",
  "Need India market expansion support for industrial product",
  "Need an AI outreach system for our production team",
  "Need a website and digital expansion for our metal business",
  "We want a simulation layer for product experience before purchase",
] as const;

export type SampleInquiry = (typeof SAMPLE_INQUIRIES)[number];
