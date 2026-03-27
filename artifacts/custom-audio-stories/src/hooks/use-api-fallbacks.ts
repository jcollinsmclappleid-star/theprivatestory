import { useGetStories, useGetSeries, useGetStory, useGetSeriesById } from "@workspace/api-client-react";
import { MOCK_STORIES, MOCK_SERIES } from "@/lib/mockData";

export function useStoriesFallback(params?: { mood?: string; search?: string }) {
  const query = useGetStories(params);
  
  // If API fails or is loading, fall back to robust mock data to keep UI beautiful
  let data = query.data;
  if (!data || query.isError) {
    data = MOCK_STORIES;
    if (params?.mood && params.mood !== "All") {
      data = data.filter(s => s.mood === params.mood);
    }
    if (params?.search) {
      data = data.filter(s => s.title.toLowerCase().includes(params.search!.toLowerCase()));
    }
  }
  
  return { ...query, data };
}

export function useSeriesFallback() {
  const query = useGetSeries();
  return { ...query, data: query.data || MOCK_SERIES };
}

export function useSeriesDetailFallback(id: string) {
  const query = useGetSeriesById(id, { query: { enabled: !!id } });
  const mockFallback = MOCK_SERIES.find(s => s.id === id) ?? MOCK_SERIES[0];
  return { ...query, data: query.data ?? mockFallback };
}

export function useStoryFallback(id: string) {
  const query = useGetStory(id);
  const mockStory = MOCK_STORIES.find(s => s.id === id) || MOCK_STORIES[0];
  return { ...query, data: query.data || mockStory };
}
