import { ArrowRightIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ApplicationAction } from '../../types/actions';
import { Button } from '../ui/Button';

interface ActionButtonProps {
  action: ApplicationAction;
  variant?: 'inline' | 'card' | 'button';
  className?: string;
  onActionExecuted?: (action: ApplicationAction) => void;
}

export function ActionButton({ action, variant = 'inline', className = '', onActionExecuted }: ActionButtonProps) {
  const navigate = useNavigate();

  const handleClick = async () => {
    console.log('Executing action:', action);

    switch (action.type) {
      case 'navigate':
        if (action.route) {
          navigate(action.route);
          onActionExecuted?.(action);
        }
        break;

      case 'open_modal':
        // Dispatch event for modal manager to handle
        window.dispatchEvent(
          new CustomEvent('openModal', {
            detail: { modalId: action.modalId, action },
          })
        );
        onActionExecuted?.(action);
        break;

      case 'start_flow':
        // Dispatch event for flow manager to handle
        window.dispatchEvent(
          new CustomEvent('startFlow', {
            detail: { flowId: action.flowId, action },
          })
        );
        onActionExecuted?.(action);
        break;

      case 'execute_function':
        // Execute a named function if available
        if (action.functionName && window[action.functionName as any]) {
          (window as any)[action.functionName](action.parameters);
          onActionExecuted?.(action);
        }
        break;

      case 'external_link':
        if (action.route) {
          window.open(action.route, '_blank');
          onActionExecuted?.(action);
        }
        break;

      case 'copy_text':
        if (action.parameters?.find(p => p.key === 'text')) {
          const text = action.parameters.find(p => p.key === 'text')?.value as string;
          await navigator.clipboard.writeText(text);
          onActionExecuted?.(action);
        }
        break;

      case 'download':
        if (action.route) {
          const link = document.createElement('a');
          link.href = action.route;
          link.download = (action.parameters?.find(p => p.key === 'filename')?.value as string) || 'download';
          link.click();
          onActionExecuted?.(action);
        }
        break;

      case 'settings':
        navigate(action.route || '/settings');
        onActionExecuted?.(action);
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  // Inline variant - looks like a link within text
  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-primary hover:text-primary/80
                   underline decoration-dotted underline-offset-2 transition-colors
                   font-medium ${className}`}
        title={action.description}
      >
        {action.icon && <span className='text-sm'>{action.icon}</span>}
        <span>{action.label}</span>
        {action.type === 'external_link' && <LinkIcon className='w-3 h-3' />}
      </button>
    );
  }

  // Card variant - displays as a card with icon and description
  if (variant === 'card') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-start gap-3 p-3 rounded-lg border border-border
                   bg-background hover:bg-accent transition-colors text-left
                   group ${className}`}
      >
        {action.icon && (
          <span className='text-2xl flex-shrink-0 group-hover:scale-110 transition-transform'>{action.icon}</span>
        )}
        <div className='flex-1 min-w-0'>
          <div className='font-medium text-foreground flex items-center gap-2'>
            {action.label}
            {action.priority === 'high' && (
              <span className='text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded'>Recommended</span>
            )}
          </div>
          {action.description && (
            <p className='text-sm text-muted-foreground mt-0.5 line-clamp-2'>{action.description}</p>
          )}
        </div>
        <ArrowRightIcon
          className='w-4 h-4 text-muted-foreground group-hover:text-foreground
                                   transition-colors flex-shrink-0 mt-1'
        />
      </button>
    );
  }

  // Button variant - standard button appearance
  return (
    <Button
      onClick={handleClick}
      variant={action.priority === 'high' ? 'default' : 'outline'}
      size='sm'
      className={className}
      title={action.description}
    >
      {action.icon && <span className='mr-2'>{action.icon}</span>}
      {action.label}
      {action.type === 'navigate' && <ArrowRightIcon className='w-4 h-4 ml-2' />}
      {action.type === 'external_link' && <LinkIcon className='w-4 h-4 ml-2' />}
    </Button>
  );
}
