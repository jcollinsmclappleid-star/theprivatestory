import { StoryCard } from "./StoryCard";
import type { Story } from "@workspace/api-client-react/src/generated/api.schemas";

interface RowSliderProps {
  title: string;
  stories: Story[];
}

export function RowSlider({ title, stories }: RowSliderProps) {
  if (!stories.length) return null;

  return (
    <section className="py-6">
      <div className="px-4 md:px-8 flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-8 pt-2 px-4 md:px-8 snap-x snap-mandatory hide-scrollbar">
        {stories.map(story => (
          <StoryCard 
            key={story.id} 
            story={story} 
            className="snap-start shrink-0 w-[160px] md:w-[220px]" 
          />
        ))}
      </div>
    </section>
  );
}
