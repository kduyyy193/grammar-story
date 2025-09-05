
import type { DailyTheme, TenseDetail } from './types';

const TENSES_DETAILS: TenseDetail[] = [
    // I. The Present Tenses
    {
      name: 'Simple Present',
      definition: 'The simple present tense is used to describe habits, general truths, repeated actions, or unchanging situations.',
      tobeFormula: {
        affirmative: 'S + am/is/are + O',
        negative: 'S + am/is/are + not + O',
        yesNoQuestion: 'Am/Is/Are + S + O?',
        whQuestion: 'WH- + am/is/are + S + O?',
      },
      regularFormula: {
        affirmative: 'S + V(s/es) + O',
        negative: 'S + do/does + not + V-inf + O',
        yesNoQuestion: 'Do/Does + S + V-inf + O?',
        whQuestion: 'WH- + do/does + S + V-inf + O?',
      },
      usage: [
        'General truths: The Earth revolves around the Sun.',
        'Habits or routines: She drinks tea every morning.',
        'Fixed schedules: The train leaves at 8 AM.',
        'Facts: Water boils at 100 degrees Celsius.',
      ],
      signals: ['always', 'usually', 'often', 'sometimes', 'every day/week/month', 'seldom', 'rarely'],
    },
    {
      name: 'Present Continuous',
      definition: 'The present continuous tense is used for actions happening at the moment of speaking or for temporary actions.',
      regularFormula: {
        affirmative: 'S + am/is/are + V-ing + O',
        negative: 'S + am/is/are + not + V-ing + O',
        yesNoQuestion: 'Am/Is/Are + S + V-ing + O?',
        whQuestion: 'WH- + am/is/are + S + V-ing + O?',
      },
      usage: [
        'Actions happening now: I am studying for my exam.',
        'Temporary situations: He is living in London for a few months.',
        'Future plans (arranged): We are meeting at the cafe tomorrow.',
        'Annoying habits (with "always"): You are always losing your keys!',
      ],
      signals: ['now', 'right now', 'at the moment', 'at present', 'look!', 'listen!'],
    },
    {
      name: 'Present Perfect',
      definition: 'The present perfect tense is used for actions that happened in the past but have a connection to the present.',
      regularFormula: {
        affirmative: 'S + have/has + V3/ed + O',
        negative: 'S + have/has + not + V3/ed + O',
        yesNoQuestion: 'Have/Has + S + V3/ed + O?',
        whQuestion: 'WH- + have/has + S + V3/ed + O?',
      },
      usage: [
        'Actions that happened at an unspecified time in the past: I have seen that movie.',
        'Life experiences: She has traveled to Japan.',
        'Actions that started in the past and continue to the present: They have lived here for ten years.',
        'Recent past events (with "just"): He has just finished his homework.',
      ],
      signals: ['just', 'recently', 'already', 'yet', 'ever', 'never', 'for', 'since'],
    },
    {
      name: 'Present Perfect Continuous',
      definition: 'This tense emphasizes the duration of an action that started in the past and continues to the present.',
      regularFormula: {
        affirmative: 'S + have/has + been + V-ing + O',
        negative: 'S + have/has + not + been + V-ing + O',
        yesNoQuestion: 'Have/Has + S + been + V-ing + O?',
        whQuestion: 'WH- + have/has + S + been + V-ing + O?',
      },
      usage: [
        'To show how long an action has been happening: I have been waiting for two hours.',
        'For actions that recently stopped and have a result in the present: It has been raining, so the ground is wet.',
      ],
      signals: ['for', 'since', 'all day', 'the whole week'],
    },
    // II. The Past Tenses
    {
      name: 'Simple Past',
      definition: 'The simple past tense is used for actions that started and finished at a specific time in the past.',
      tobeFormula: {
        affirmative: 'S + was/were + O',
        negative: 'S + was/were + not + O',
        yesNoQuestion: 'Was/Were + S + O?',
        whQuestion: 'WH- + was/were + S + O?',
      },
      regularFormula: {
        affirmative: 'S + V2/ed + O',
        negative: 'S + did + not + V-inf + O',
        yesNoQuestion: 'Did + S + V-inf + O?',
        whQuestion: 'WH- + did + S + V-inf + O?',
      },
      usage: [
        'Completed actions in the past: We went to the cinema yesterday.',
        'A series of completed actions: He woke up, brushed his teeth, and had breakfast.',
        'Past habits: I played soccer when I was a child.',
      ],
      signals: ['yesterday', 'last night/week/month', 'ago', 'in 2010'],
    },
    {
      name: 'Past Continuous',
      definition: 'The past continuous tense is used for an action that was in progress at a specific time in the past.',
      regularFormula: {
        affirmative: 'S + was/were + V-ing + O',
        negative: 'S + was/were + not + V-ing + O',
        yesNoQuestion: 'Was/Were + S + V-ing + O?',
        whQuestion: 'WH- + was/were + S + V-ing + O?',
      },
      usage: [
        'An action in progress at a specific past time: At 8 PM last night, I was watching TV.',
        'An interrupted action in the past: I was cooking when the phone rang.',
        'Two actions happening at the same time in the past: She was reading while he was playing video games.',
      ],
      signals: ['while', 'when', 'at that moment', 'at 8 PM last night'],
    },
    {
      name: 'Past Perfect',
      definition: 'The past perfect tense is used to describe an action that happened before another action in the past.',
      regularFormula: {
        affirmative: 'S + had + V3/ed + O',
        negative: 'S + had + not + V3/ed + O',
        yesNoQuestion: 'Had + S + V3/ed + O?',
        whQuestion: 'WH- + had + S + V3/ed + O?',
      },
      usage: [
        'To show the order of two past events: The train had left when I arrived at the station.',
        'With reported speech: She said that she had finished her work.',
      ],
      signals: ['before', 'after', 'already', 'just', 'when', 'by the time'],
    },
    {
      name: 'Past Perfect Continuous',
      definition: 'This tense shows the duration of an action that was in progress before another event in the past.',
      regularFormula: {
        affirmative: 'S + had + been + V-ing + O',
        negative: 'S + had + not + been + V-ing + O',
        yesNoQuestion: 'Had + S + been + V-ing + O?',
        whQuestion: 'WH- + had + S + been + V-ing + O?',
      },
      usage: [
        'To show how long a past action was happening before another: He had been working there for five years before he quit.',
        'To show the cause of a past action: I was tired because I had been studying all night.',
      ],
      signals: ['for', 'since', 'before', 'until'],
    },
    // III. The Future Tenses
    {
      name: 'Simple Future',
      definition: 'The simple future tense is used for predictions, promises, or spontaneous decisions about the future.',
      regularFormula: {
        affirmative: 'S + will + V-inf + O',
        negative: 'S + will + not + V-inf + O',
        yesNoQuestion: 'Will + S + V-inf + O?',
        whQuestion: 'WH- + will + S + V-inf + O?',
      },
      usage: [
        'Spontaneous decisions: It\'s cold. I will close the window.',
        'Predictions or opinions: I think it will rain tomorrow.',
        'Promises: I will help you with your project.',
        'Facts about the future: The sun will rise at 6 AM.',
      ],
      signals: ['tomorrow', 'next week/month/year', 'in the future', 'I think', 'probably'],
    },
    {
      name: 'Future Continuous',
      definition: 'The future continuous tense is used for an action that will be in progress at a specific time in the future.',
      regularFormula: {
        affirmative: 'S + will be + V-ing + O',
        negative: 'S + will not be + V-ing + O',
        yesNoQuestion: 'Will + S + be + V-ing + O?',
        whQuestion: 'WH- + will + S + be + V-ing + O?',
      },
      usage: [
        'Actions in progress at a specific future time: This time next week, I will be relaxing on the beach.',
        'Polite questions about someone\'s plans: Will you be using the computer for long?',
      ],
      signals: ['this time next week', 'at 10 AM tomorrow', 'in one year'],
    },
    {
      name: 'Future Perfect',
      definition: 'The future perfect tense is used to describe an action that will be completed before a specific time in the future.',
      regularFormula: {
        affirmative: 'S + will have + V3/ed + O',
        negative: 'S + will not have + V3/ed + O',
        yesNoQuestion: 'Will + S + have + V3/ed + O?',
        whQuestion: 'WH- + will + S + have + V3/ed + O?',
      },
      usage: [
        'An action completed before a future moment: By 2030, I will have finished my studies.',
        'To express conviction that something has happened: He will have arrived by now.',
      ],
      signals: ['by the time', 'by next month', 'by 2030', 'before'],
    },
    {
      name: 'Future Perfect Continuous',
      definition: 'This tense emphasizes the duration of an action up to a certain point in the future.',
      regularFormula: {
        affirmative: 'S + will have been + V-ing + O',
        negative: 'S + will not have been + V-ing + O',
        yesNoQuestion: 'Will + S + have been + V-ing + O?',
        whQuestion: 'WH- + will + S + have been + V-ing + O?',
      },
      usage: [
        'To show how long an action will have been happening at a future point: By next year, she will have been teaching for twenty years.',
        'To show the cause of a future situation: My eyes will be tired because I will have been reading for hours.',
      ],
      signals: ['for', 'by the time', 'by next year'],
    },
];


// A dedicated, comprehensive guide to the 12 tenses for the static Theory page.
export const TENSES_THEORY: DailyTheme = {
  title: 'The 12 English Tenses',
  category: 'All Tenses',
  theory: {
    introduction: 'Here is a complete guide to the 12 main tenses in English, divided into three time frames: Present, Past, and Future. Each time frame has four aspects: Simple, Continuous, Perfect, and Perfect Continuous.',
    sections: [
      {
        title: 'I. The Present Tenses',
        tenses: TENSES_DETAILS.slice(0, 4)
      },
      {
        title: 'II. The Past Tenses',
        tenses: TENSES_DETAILS.slice(4, 8)
      },
      {
        title: 'III. The Future Tenses',
        tenses: TENSES_DETAILS.slice(8, 12)
      }
    ]
  }
};


// A list of focused themes for daily rotation on the Home and Challenges pages.
export const DAILY_THEMES: Omit<DailyTheme, 'theory'>[] = [
    { title: 'Simple Past', category: 'Simple Past' },
    { title: 'Present Continuous', category: 'Present Continuous' },
    { title: 'Present Perfect', category: 'Present Perfect' },
    { title: 'Simple Future', category: 'Simple Future' },
    { title: 'Past Continuous', category: 'Past Continuous' },
    { title: 'Prepositions of Place', category: 'Prepositions' },
    { title: 'Past Perfect', category: 'Past Perfect' },
    { title: 'Future Continuous', category: 'Future Continuous' },
];