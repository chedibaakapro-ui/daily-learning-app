interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  createdAt: string;
}

interface TopicsListProps {
  topics: Topic[];
}

export default function TopicsList({ topics }: TopicsListProps) {
  if (topics.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No topics yet. Create some topics via the API!
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <div key={topic.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {topic.category}
            </span>
            <span className="text-xs text-gray-500">{topic.difficulty}</span>
          </div>
          <h3 className="text-lg font-bold mb-2">{topic.title}</h3>
          <p className="text-gray-600 text-sm">{topic.content.slice(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
}