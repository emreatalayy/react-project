import { per100, scenario } from './replay';
import type { MatchStory, StoryApi } from './story';

export function storyApi(story: MatchStory): StoryApi {
  const { data, whatifs } = story;
  return {
    data,
    at: (m, lens, on) => scenario(data, whatifs, m, lens, on),
    per100,
    xgFrom: (side, from) => data.shots.filter((s) => s.team === side && s.el >= from).reduce((sum, s) => sum + s.xg, 0),
  };
}
