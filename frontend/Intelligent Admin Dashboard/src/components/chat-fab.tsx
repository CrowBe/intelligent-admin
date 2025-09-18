import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatFabProps {
  onClick: () => void;
  hasNewMessages?: boolean;
  isOpen?: boolean;
}

export function ChatFab({ onClick, hasNewMessages = false, isOpen = false }: ChatFabProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-slate-600 hover:bg-slate-700' 
            : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700'
        } text-white border-0 relative group`}
        size="lg"
      >
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
        
        <MessageCircle className={`transition-transform duration-300 ${isOpen ? 'w-5 h-5 rotate-180' : 'w-6 h-6'}`} />
        
        {hasNewMessages && !isOpen && (
          <Badge className="absolute -top-2 -left-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-pulse">
            !
          </Badge>
        )}
      </Button>
      
      {!isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-sm text-slate-700">
            💡 Ask me anything about your business or the current page
          </p>
          <div className="absolute bottom-0 right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white transform translate-y-full"></div>
        </div>
      )}
    </div>
  );
}