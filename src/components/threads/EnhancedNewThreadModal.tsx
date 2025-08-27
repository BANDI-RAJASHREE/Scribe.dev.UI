import {
  BookOpen,
  Brain,
  Edit,
  Eye,
  Globe,
  MessageCircle,
  Pin,
  Send,
  Tag,
  X,
} from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Thread } from "./threadTypes";

interface EnhancedNewThreadModalProps {
  classroomId?: string; // Optional for generic threads
  classroomName?: string;
  units?: Array<{ id: string; name: string }>; // Optional for generic threads
  threadType: "classroom" | "generic";
  onClose: () => void;
  onSubmit: (
    threadData: Omit<
      Thread,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "repliesCount"
      | "isResolved"
      | "hasAiInsights"
    >
  ) => void;
}

const categories = [
  { id: "general", name: "General Discussion", icon: MessageCircle },
  { id: "announcements", name: "Announcements", icon: Pin },
  { id: "help", name: "Help & Support", icon: Brain },
  { id: "resources", name: "Resources", icon: BookOpen },
];

const EnhancedNewThreadModal: React.FC<EnhancedNewThreadModalProps> = ({
  classroomId,
  classroomName,
  units = [],
  threadType,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibility, setVisibility] = useState<"public" | "restricted">(
    "public"
  );
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Constants for limits
  const TITLE_LIMIT = 150;
  const CONTENT_LIMIT = 2500;

  // Word counting function
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim().toLowerCase())) {
        setTags([...tags, currentTag.trim().toLowerCase()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const generateAiSuggestion = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsGeneratingAiSuggestion(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Auto-generate tags based on content
    const autoTags: string[] = [];
    if (content.toLowerCase().includes("equation")) autoTags.push("equations");
    if (content.toLowerCase().includes("graph")) autoTags.push("graphing");
    if (content.toLowerCase().includes("formula")) autoTags.push("formulas");
    if (content.toLowerCase().includes("proof")) autoTags.push("proofs");

    setTags((prev) => [...new Set([...prev, ...autoTags])]);
    setIsGeneratingAiSuggestion(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    // Validation based on thread type
    if (threadType === "classroom" && !selectedUnitId) return;
    if (threadType === "generic" && !selectedCategory) return;

    const baseThreadData = {
      title: title.trim(),
      content: content.trim(),
      authorId: "current-user-id",
      authorName: "Current User",
      tags,
      aiSummary: undefined,
      aiSuggestedAnswer: undefined,
    };

    if (threadType === "classroom") {
      const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
      onSubmit({
        ...baseThreadData,
        threadType: "classroom",
        classroomId: classroomId!,
        classroomName: classroomName || "",
        unitId: selectedUnitId,
        unitName: selectedUnit?.name || "",
      } as any);
    } else {
      onSubmit({
        ...baseThreadData,
        threadType: "generic",
        category: selectedCategory,
        visibility,
        allowedRoles:
          visibility === "restricted" ? ["teacher", "admin"] : undefined,
      } as any);
    }
  };

  const isValid =
    title.trim() &&
    content.trim() &&
    (threadType === "classroom" ? selectedUnitId : selectedCategory);
  const wordCount = countWords(content);
  const isContentOverLimit = content.length > CONTENT_LIMIT;

  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold text-white mb-3">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold text-white mb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-medium text-white mb-2">{children}</h3>
    ),
    p: ({ children }: any) => <p className="mb-2 text-gray-300">{children}</p>,
    code: ({ children, inline }: any) =>
      inline ? (
        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm text-blue-300">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-900 border border-gray-700 rounded p-3 overflow-x-auto mb-3">
          <code className="text-green-300 text-sm">{children}</code>
        </pre>
      ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-3 text-gray-300">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-3 text-gray-300">
        {children}
      </ol>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-3 py-1 bg-gray-800/50 rounded-r mb-3 italic text-gray-300">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="text-gray-200">{children}</em>,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {threadType === "classroom" ? (
              <BookOpen className="w-6 h-6 text-green-400" />
            ) : (
              <Globe className="w-6 h-6 text-blue-400" />
            )}
            <h2 className="text-xl font-semibold text-white">
              {threadType === "classroom"
                ? "Start Classroom Discussion"
                : "Start Global Discussion"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {/* Thread Type Info */}
          <div
            className={`p-4 rounded-lg border ${
              threadType === "classroom"
                ? "bg-green-600/10 border-green-600/30"
                : "bg-blue-600/10 border-blue-600/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {threadType === "classroom" ? (
                <BookOpen className="w-5 h-5 text-green-400" />
              ) : (
                <Globe className="w-5 h-5 text-blue-400" />
              )}
              <span
                className={`font-medium ${
                  threadType === "classroom"
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {threadType === "classroom"
                  ? "Classroom Thread"
                  : "Global Thread"}
              </span>
            </div>
            <p
              className={`text-sm ${
                threadType === "classroom" ? "text-green-200" : "text-blue-200"
              }`}
            >
              {threadType === "classroom"
                ? `This discussion will be visible to all members of ${
                    classroomName || "this classroom"
                  }.`
                : "This discussion will be visible to all users across the platform."}
            </p>
          </div>

          {/* Unit/Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {threadType === "classroom" ? "Select Unit" : "Select Category"}
            </label>
            {threadType === "classroom" ? (
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a unit...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Visibility Settings for Generic Threads */}
          {threadType === "generic" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thread Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === "public"}
                    onChange={(e) => setVisibility(e.target.value as "public")}
                    className="mr-2 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">
                    Public - Visible to all users
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="restricted"
                    checked={visibility === "restricted"}
                    onChange={(e) =>
                      setVisibility(e.target.value as "restricted")
                    }
                    className="mr-2 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">
                    Restricted - Visible to teachers and admins only
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {threadType === "classroom"
                ? "Question Title"
                : "Discussion Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
              placeholder={
                threadType === "classroom"
                  ? "What's your question about?"
                  : "What would you like to discuss?"
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div
              className={`text-xs mt-1 ${
                title.length > TITLE_LIMIT * 0.9
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              {title.length}/{TITLE_LIMIT} characters
            </div>
          </div>

          {/* Content with Preview Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                {threadType === "classroom"
                  ? "Describe Your Question"
                  : "Share Your Thoughts"}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                    showPreview
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {showPreview ? (
                    <Edit className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {!showPreview ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    threadType === "classroom"
                      ? "Provide details about what you're struggling with. Include any specific examples or concepts you need help understanding... (Markdown supported: **bold**, *italic*, `code`, etc.)"
                      : "Share your thoughts, insights, or start a meaningful discussion... (Markdown supported: **bold**, *italic*, `code`, etc.)"
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-vertical"
                  required
                />
              ) : (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 min-h-[150px] max-h-[300px] overflow-y-auto">
                  {content.trim() ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown components={markdownComponents}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      Preview will appear here as you type...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              className={`text-xs mt-1 flex justify-between ${
                isContentOverLimit
                  ? "text-red-400"
                  : content.length > CONTENT_LIMIT * 0.9
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              <span>
                {content.length}/{CONTENT_LIMIT} characters
              </span>
              <span>
                {wordCount} words (~{Math.ceil(wordCount / 5)} minute read)
              </span>
            </div>
          </div>

          {/* AI Suggestion Button */}
          <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-medium">AI Assistant</span>
            </div>
            <p className="text-purple-200 text-sm mb-3">
              Get AI-powered suggestions and automatically generated tags for
              your {threadType === "classroom" ? "question" : "discussion"}.
            </p>
            <button
              type="button"
              onClick={generateAiSuggestion}
              disabled={
                !title.trim() || !content.trim() || isGeneratingAiSuggestion
              }
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Brain className="w-4 h-4" />
              {isGeneratingAiSuggestion ? "Analyzing..." : "Get AI Suggestions"}
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags to categorize your discussion (press Enter to add)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <Tag className="w-3 h-3" />#{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isContentOverLimit}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              {threadType === "classroom"
                ? "Post Question"
                : "Start Discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedNewThreadModal;
