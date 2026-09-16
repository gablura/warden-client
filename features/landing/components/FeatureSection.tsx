import { ReactNode } from "react";

interface FeatureSectionProps {
  number: string;
  title: string;
  description: string;
  details: string[];
  tone: "success" | "warning" | "info" | "neutral" | "danger";
  reverse?: boolean;
  visual: ReactNode;
}

const toneVar: Record<string, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  info: "var(--color-info)",
  neutral: "var(--color-foreground-secondary)",
  danger: "var(--color-danger)",
};

const toneSubtle: Record<string, string> = {
  success: "var(--color-success-subtle)",
  warning: "var(--color-warning-subtle)",
  info: "var(--color-info-subtle)",
  neutral: "var(--color-border)",
  danger: "var(--color-danger-subtle)",
};

export function FeatureSection({
  number,
  title,
  description,
  details,
  tone,
  reverse = false,
  visual,
}: FeatureSectionProps) {
  return (
    <div className="border-t border-border py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
            reverse ? "lg:[direction:rtl]" : ""
          }`}
        >
          {/* Text */}
          <div className={reverse ? "lg:[direction:ltr]" : ""}>
            <div className="flex items-center gap-3">
              <span
                className="data-mono text-2xl font-semibold sm:text-3xl"
                style={{ color: toneVar[tone] }}
              >
                {number}
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: toneSubtle[tone] }} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground sm:text-2xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-secondary sm:text-base">
              {description}
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {details.map((detail) => (
                <li key={detail} className="flex items-start gap-2.5 text-sm text-foreground-secondary">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: toneVar[tone] }}
                  />
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className={reverse ? "lg:[direction:ltr]" : ""}>
            {visual}
          </div>
        </div>
      </div>
    </div>
  );
}
