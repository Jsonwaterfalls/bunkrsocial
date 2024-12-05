import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type TimeRange = "day" | "week" | "quarter";

export const TrendingTopics = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("day");

  // Mock data - would be replaced with real data
  const topics = [
    { id: 1, topic: "Climate Change", count: 156 },
    { id: 2, topic: "AI Safety", count: 143 },
    { id: 3, topic: "Public Health", count: 128 },
    { id: 4, topic: "Space Exploration", count: 112 },
    { id: 5, topic: "Renewable Energy", count: 98 },
  ];

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto mt-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-navy">Trending Topics</h3>
        <div className="space-x-2">
          {(["day", "week", "quarter"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-navy hover:bg-navy-light" : ""}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-sage">{topic.topic}</span>
            <span className="text-sm text-sage-light">{topic.count} verifications</span>
          </div>
        ))}
      </div>
    </Card>
  );
};