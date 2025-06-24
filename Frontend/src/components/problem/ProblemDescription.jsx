// src/components/problem/ProblemDescription.js

// This helper function is perfect, no changes needed.
const renderDescription = (text = '') => {
  return text.split(/(`[^`]+`|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-gray-700 text-yellow-300 rounded-md px-1.5 py-0.5 text-sm font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index} className="font-semibold text-gray-100">{part.slice(1, -1)}</strong>
    }
    return part;
  });
};

// This helper function is perfect, no changes needed.
const getDifficultyStyles = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-green-900/50 text-green-400 border border-green-700';
    case 'medium': return 'bg-yellow-900/50 text-yellow-400 border border-yellow-700';
    case 'hard': return 'bg-red-900/50 text-red-400 border border-red-700';
    default: return 'bg-gray-700 text-gray-300';
  }
};

const ProblemDescription = ({ problem }) => {
  if (!problem) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-50">{problem.title}</h1>
      <div className="flex flex-wrap items-center gap-4">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getDifficultyStyles(problem.difficulty)}`}>
          {problem.difficulty}
        </span>

        {problem.tags && problem.tags.map(tag => (
          <div 
            key={tag._id} 
            className="badge badge-outline border-zinc-600 text-zinc-400 capitalize"
          >
            {tag.name}
          </div>
        ))}
      </div>

      <div className="text-base text-gray-300 leading-relaxed space-y-4">
        {renderDescription(problem.description)}
      </div>

      <div className="space-y-6">
        {problem.visibleTestCases.map((example, index) => (
          <div key={index}>
            <p className="font-semibold text-gray-100 mb-3 text-lg">Example {index + 1}:</p>
            <div className="bg-[#282828] p-4 rounded-lg text-sm font-mono space-y-3 border border-zinc-700">
              <div><strong className="text-gray-400 font-medium">Input:</strong> {example.displayInput ? example.displayInput : example.input}</div>
              <div><strong className="text-gray-400 font-medium">Output:</strong> {example.displayOutput ? example.displayOutput : example.output}</div>
              {example.explanation && <div><strong className="text-gray-400 font-medium">Explanation:</strong> <span className="whitespace-pre-wrap">{example.explanation}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemDescription;