import { BookOpen, Filter, Globe, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import EnhancedThreadCard from "./EnhancedThreadCard";
import { Thread } from "./threadTypes";

interface ThreadsListProps {
  threads: Thread[];
  isLoading?: boolean;
  onThreadClick: (thread: Thread) => void;
  onCreateThread: (threadType: "classroom" | "generic") => void;
  showFilters?: boolean;
  classroomContext?: {
    id: string;
    name: string;
    units: Array<{ id: string; name: string }>;
  };
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  isLoading = false,
  onThreadClick,
  onCreateThread,
  showFilters = true,
  classroomContext,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThreadType, setSelectedThreadType] = useState<
    "all" | "classroom" | "generic"
  >("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "replies" | "created">(
    "recent"
  );

  // Get unique categories from generic threads
  const availableCategories = useMemo(() => {
    const categories = threads
      .filter((thread) => thread.threadType === "generic")
      .map((thread) => thread.category);
    return [...new Set(categories)];
  }, [threads]);

  // Filter and sort threads
  const filteredThreads = useMemo(() => {
    let filtered = threads;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (thread) =>
          thread.title.toLowerCase().includes(query) ||
          thread.content.toLowerCase().includes(query) ||
          thread.authorName.toLowerCase().includes(query) ||
          thread.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Thread type filter
    if (selectedThreadType !== "all") {
      filtered = filtered.filter(
        (thread) => thread.threadType === selectedThreadType
      );
    }

    // Unit filter (for classroom threads)
    if (selectedUnit !== "all") {
      filtered = filtered.filter(
        (thread) =>
          thread.threadType === "classroom" && thread.unitId === selectedUnit
      );
    }

    // Category filter (for generic threads)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (thread) =>
          thread.threadType === "generic" &&
          thread.category === selectedCategory
      );
    }

    // Sort threads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "replies":
          return b.repliesCount - a.repliesCount;
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    threads,
    searchQuery,
    selectedThreadType,
    selectedUnit,
    selectedCategory,
    sortBy,
  ]);

  const threadStats = useMemo(() => {
    const total = threads.length;
    const resolved = threads.filter((t) => t.isResolved).length;
    const open = total - resolved;
    const classroom = threads.filter(
      (t) => t.threadType === "classroom"
    ).length;
    const generic = threads.filter((t) => t.threadType === "generic").length;

    return { total, resolved, open, classroom, generic };
  }, [threads]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading threads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Discussion Threads
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>• {threadStats.total} Total</span>
            <span className="text-green-400">
              • {threadStats.resolved} Resolved
            </span>
            <span className="text-red-400">• {threadStats.open} Open</span>
            {!classroomContext && (
              <>
                <span className="text-green-400">
                  • {threadStats.classroom} Classroom
                </span>
                <span className="text-blue-400">
                  • {threadStats.generic} Global
                </span>
              </>
            )}
          </div>
        </div>

        {/* Create Thread Buttons */}
        <div className="flex items-center gap-2">
          {classroomContext && (
            <button
              onClick={() => onCreateThread("classroom")}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              New Question
            </button>
          )}
          <button
            onClick={() => onCreateThread("generic")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Globe className="w-4 h-4" />
            New Discussion
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search threads, content, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Thread Type Filter */}
              {!classroomContext && (
                <select
                  value={selectedThreadType}
                  onChange={(e) => setSelectedThreadType(e.target.value as any)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="classroom">Classroom Only</option>
                  <option value="generic">Global Only</option>
                </select>
              )}

              {/* Unit Filter */}
              {classroomContext && classroomContext.units.length > 0 && (
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Units</option>
                  {classroomContext.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="replies">Most Replies</option>
                <option value="created">Newest</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery ||
            selectedThreadType !== "all" ||
            selectedUnit !== "all" ||
            selectedCategory !== "all") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Active filters:</span>
              <div className="flex flex-wrap gap-1">
                {searchQuery && (
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedThreadType !== "all" && (
                  <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                    Type: {selectedThreadType}
                  </span>
                )}
                {selectedUnit !== "all" && (
                  <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
                    Unit:{" "}
                    {
                      classroomContext?.units.find((u) => u.id === selectedUnit)
                        ?.name
                    }
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
                    Category: {selectedCategory}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedThreadType("all");
                    setSelectedUnit("all");
                    setSelectedCategory("all");
                  }}
                  className="text-gray-400 hover:text-white text-xs ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {threads.length === 0 ? (
                <>
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No discussions yet</p>
                  <p className="text-sm">
                    Start the conversation by creating the first thread!
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No threads match your filters</p>
                  <p className="text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <EnhancedThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => onThreadClick(thread)}
              showClassroomInfo={!classroomContext}
            />
          ))
        )}
      </div>

      {/* Load More or Pagination could go here */}
    </div>
  );
};

export default ThreadsList;
