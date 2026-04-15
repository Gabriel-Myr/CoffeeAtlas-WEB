import { GENERATED_LIGHT_QUESTION_COPY } from './light-question-copy.generated.ts';

export type GuidedStepKey = 'process_base' | 'process_style' | 'continent' | 'country' | 'variety' | 'done';

export interface LightQuestionChoiceCopy {
  id: string;
  title: string;
  description: string;
}

export interface LightQuestionCopyConfig {
  miniprogram: {
    guidedCard: {
      label: string;
      collapsed: Record<'default' | 'guided' | 'direct', { title: string; description: string }>;
      steps: Record<GuidedStepKey, { title: string; description: string }>;
      processChoices: readonly LightQuestionChoiceCopy[];
      processStyleChoices: readonly LightQuestionChoiceCopy[];
      continentChoices: readonly LightQuestionChoiceCopy[];
      ui: {
        searchPlaceholder: string;
        toggleExpand: string;
        toggleCollapse: string;
        collapsedHint: string;
        loadingProcessBase: string;
        loadingProcessStyle: string;
        loadingContinent: string;
        loadingCountry: string;
        loadingVariety: string;
        noCountryOptions: string;
        noVarietyOptions: string;
        skipVariety: string;
        restartAnswers: string;
        noMatchingProcessBase: string;
        noMatchingProcessStyle: string;
        noMatchingContinent: string;
        loadResultsError: string;
        loadDiscoverError: string;
      };
    };
    discoverEditorial: {
      templates: {
        default: { title: string; subtitle: string };
        processBase: { titleTemplate: string; subtitle: string };
        continent: { titleTemplate: string; subtitleTemplate: string };
        country: { titleTemplate: string; subtitle: string };
        variety: { titleTemplate: string; subtitle: string };
      };
      reasons: Record<'variety' | 'country' | 'processBase' | 'continent' | 'newArrival' | 'default', string>;
    };
  };
}

export const LIGHT_QUESTION_COPY = GENERATED_LIGHT_QUESTION_COPY as unknown as LightQuestionCopyConfig;

export function formatLightQuestionTemplate(
  template: string,
  variables: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = variables[key];
    return value === null || value === undefined ? '' : String(value);
  });
}
