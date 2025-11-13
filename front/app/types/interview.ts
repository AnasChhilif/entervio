export type InterviewerType = "nice" | "neutral" | "mean";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface InterviewerOption {
  type: InterviewerType;
  label: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const INTERVIEWER_OPTIONS: InterviewerOption[] = [
  {
    type: "nice",
    label: "Bienveillant",
    icon: "😊",
    description: "Un recruteur chaleureux et encourageant qui vous met à l'aise",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
  },
  {
    type: "neutral",
    label: "Neutre",
    icon: "😐",
    description:
      "Un recruteur professionnel et objectif, factuel dans ses évaluations",
    color: "text-primary-700",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-300",
  },
  {
    type: "mean",
    label: "Exigeant",
    icon: "😤",
    description:
      "Un recruteur direct et critique qui teste votre résistance au stress",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
];

export const INTERVIEWER_LABELS = {
  nice: {
    name: "Bienveillant",
    icon: "😊",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
  },
  neutral: {
    name: "Professionnel",
    icon: "😐",
    color: "text-primary-700",
    bg: "bg-primary-50",
    border: "border-primary-300",
  },
  mean: {
    name: "Exigeant",
    icon: "😤",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-300",
  },
} as const;