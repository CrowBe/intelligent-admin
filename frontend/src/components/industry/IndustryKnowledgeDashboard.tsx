import { useState, useEffect } from 'react';
import { useAppAuth } from '../../contexts/KindeAuthContext';
import { industryKnowledgeApi, IndustryStats, IndustryKnowledgeItem, IndustryCategory } from '../../services/industryKnowledgeApi';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input, Alert, AlertDescription } from '../ui';
import { Search, RefreshCw, Database, TrendingUp, Clock, ExternalLink, BookOpen, FileText, Shield, DollarSign } from 'lucide-react';

export const IndustryKnowledgeDashboard = () => {
  const { getAccessToken } = useAppAuth();
  const [stats, setStats] = useState<IndustryStats | null>(null);
  const [categories, setCategories] = useState<IndustryCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndustryKnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, categoriesData] = await Promise.all([
        industryKnowledgeApi.getStats(getAccessToken),
        industryKnowledgeApi.getCategories(getAccessToken)
      ]);

      setStats(statsData);
      setCategories(categoriesData.categories);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load industry knowledge data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setError(null);

      const results = await industryKnowledgeApi.searchKnowledge(
        searchQuery,
        20,
        getAccessToken
      );

      // Combine contextual and database results
      const allResults = [
        ...results.results.contextual.regulations,
        ...results.results.contextual.standards,
        ...results.results.contextual.pricing,
        ...results.results.contextual.safety,
        ...results.results.database
      ];

      // Remove duplicates by ID
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching knowledge:', error);
      setError('Failed to search industry knowledge');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateKnowledge = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      await industryKnowledgeApi.updateKnowledgeBase(getAccessToken);
      
      // Reload stats after update
      setTimeout(() => loadDashboardData(), 2000);
      
    } catch (error) {
      console.error('Error updating knowledge base:', error);
      setError('Failed to update industry knowledge base');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'regulation': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'standard': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'pricing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'safety': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'best_practice': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getContentTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'regulation': <Shield className="h-4 w-4" />,
      'standard': <FileText className="h-4 w-4" />,
      'pricing': <DollarSign className="h-4 w-4" />,
      'safety': <Shield className="h-4 w-4" />,
      'best_practice': <BookOpen className="h-4 w-4" />
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Industry Knowledge</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Industry Knowledge</h2>
          <p className="text-muted-foreground">
            Australian trade industry regulations, standards, and best practices
          </p>
        </div>
        <Button
          onClick={handleUpdateKnowledge}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Updating...' : 'Update Knowledge'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sources</p>
                  <p className="text-2xl font-bold">{stats.activeSources}/{stats.totalSources}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cache Status</p>
                  <p className="text-2xl font-bold capitalize">{stats.cacheStatus}</p>
                </div>
                <div className={`h-8 w-8 rounded-full ${stats.cacheStatus === 'loaded' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-bold">{formatDate(stats.lastUpdate)}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Industry Knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search regulations, standards, pricing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>
          
          {/* Quick Search Suggestions */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">Quick searches for Australian trades:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'electrical safety standards',
                'plumbing regulations NSW',
                'construction permits',
                'workplace safety requirements',
                'GST for trade services',
                'apprenticeship guidelines'
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.content.substring(0, 200)}...
                      </p>
                    </div>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-1 hover:bg-muted rounded"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="default" className={getContentTypeColor(item.contentType)}>
                      <span className="mr-1">{getContentTypeIcon(item.contentType)}</span>
                      {item.contentType.replace('_', ' ')}
                    </Badge>
                    <Badge variant="default">
                      {item.source}
                    </Badge>
                    <span className="text-muted-foreground">
                      Score: {Math.round(item.relevanceScore)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(item.lastUpdated)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.name} className="text-center p-4 border rounded-lg">
                  <p className="font-medium capitalize">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.count} items</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};