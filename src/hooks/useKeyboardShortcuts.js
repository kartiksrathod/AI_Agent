import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/advanced-toast';

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Track key sequence for multi-key shortcuts
  const [keySequence, setKeySequence] = useState('');
  const [sequenceTimeout, setSequenceTimeout] = useState(null);

  const shortcuts = {
    // Navigation shortcuts
    'g h': { action: () => navigate('/'), description: 'Go to Home' },
    'g p': { action: () => navigate('/papers'), description: 'Go to Papers' },
    'g n': { action: () => navigate('/notes'), description: 'Go to Notes' },
    'g s': { action: () => navigate('/syllabus'), description: 'Go to Syllabus' },
    'g f': { action: () => navigate('/forum'), description: 'Go to Forum' },
    'g u': { action: () => navigate('/profile'), description: 'Go to Profile' },
    
    // Action shortcuts
    '?': { action: () => showShortcutsHelp(), description: 'Show keyboard shortcuts' },
    'Escape': { action: () => handleEscape(), description: 'Close modals/dropdowns' },
  };

  const showShortcutsHelp = useCallback(() => {
    toast.info('Keyboard Shortcuts Available', {
      title: 'Power User Features',
      description: 'Press Ctrl+Shift+? to see all shortcuts',
      duration: 5000
    });
  }, [toast]);

  const handleEscape = useCallback(() => {
    // Close any open modals, dropdowns, etc.
    const openElements = document.querySelectorAll('[data-state="open"]');
    openElements.forEach(element => {
      const closeButton = element.querySelector('[data-dismiss="true"]');
      if (closeButton) closeButton.click();
    });
    
    // Clear search focus
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput && document.activeElement === searchInput) {
      searchInput.blur();
    }
  }, []);

  const handleKeyDown = useCallback((event) => {
    // Don't handle shortcuts when user is typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      // Exception: allow Escape in inputs
      if (event.key === 'Escape') {
        event.target.blur();
      }
      return;
    }

    const key = event.key.toLowerCase();
    
    // Handle single key shortcuts
    if (shortcuts[key]) {
      event.preventDefault();
      shortcuts[key].action();
      return;
    }

    // Handle Ctrl/Cmd combinations
    if (event.ctrlKey || event.metaKey) {
      const combo = `${event.ctrlKey ? 'ctrl+' : 'cmd+'}${key}`;
      
      switch (combo) {
        case 'ctrl+k':
        case 'cmd+k':
          event.preventDefault();
          // Focus search (handled in SmartSearchBar)
          break;
        case 'ctrl+shift+?':
        case 'cmd+shift+?':
          event.preventDefault();
          showDetailedShortcuts();
          break;
        case 'ctrl+d':
        case 'cmd+d':
          event.preventDefault();
          toggleTheme();
          break;
      }
      return;
    }

    // Handle character sequences (like 'g h' for go home)
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
    }

    const newSequence = keySequence + key;
    
    // Check if this sequence matches any shortcut
    if (shortcuts[newSequence]) {
      event.preventDefault();
      shortcuts[newSequence].action();
      setKeySequence('');
      toast.success(`Shortcut: ${newSequence}`, {
        description: shortcuts[newSequence].description,
        duration: 1500
      });
      return;
    }

    // Check if this could be the start of a valid sequence
    const hasValidSequence = Object.keys(shortcuts).some(shortcut => 
      shortcut.startsWith(newSequence) && shortcut.length > newSequence.length
    );

    if (hasValidSequence) {
      setKeySequence(newSequence);
      // Show hint for possible completions
      const possibleShortcuts = Object.keys(shortcuts)
        .filter(shortcut => shortcut.startsWith(newSequence) && shortcut.length > newSequence.length)
        .map(shortcut => shortcut.slice(newSequence.length));
      
      if (possibleShortcuts.length > 0) {
        toast.info(`Type: ${possibleShortcuts.join(', ')}`, {
          title: `Shortcut sequence: ${newSequence}...`,
          duration: 2000
        });
      }

      // Clear sequence after 2 seconds
      const timeout = setTimeout(() => {
        setKeySequence('');
      }, 2000);
      setSequenceTimeout(timeout);
    } else {
      setKeySequence('');
    }
  }, [keySequence, sequenceTimeout, shortcuts, toast, navigate]);

  const toggleTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.success('Switched to Light Mode', {
        description: 'Theme preference saved',
        duration: 2000
      });
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.success('Switched to Dark Mode', {
        description: 'Theme preference saved',
        duration: 2000
      });
    }
  }, [toast]);

  const showDetailedShortcuts = useCallback(() => {
    // Create and show shortcuts modal
    const shortcutsList = Object.entries(shortcuts).map(([key, { description }]) => 
      `${key} - ${description}`
    ).join('\n');

    toast.info('Keyboard Shortcuts', {
      title: 'Available Shortcuts',
      description: `
Navigation:
• g h - Go to Home
• g p - Go to Papers  
• g n - Go to Notes
• g s - Go to Syllabus
• g f - Go to Forum
• g u - Go to Profile

Actions:
• Ctrl+K - Open Search
• Ctrl+D - Toggle Theme
• ? - Show this help
• Esc - Close modals
      `,
      duration: 10000
    });
  }, [shortcuts, toast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  }, [handleKeyDown, sequenceTimeout]);

  // Show welcome message with shortcuts hint
  useEffect(() => {
    const hasSeenShortcuts = localStorage.getItem('hasSeenShortcuts');
    if (!hasSeenShortcuts) {
      setTimeout(() => {
        toast.info('Pro Tip: Press ? for keyboard shortcuts', {
          title: 'Power User Features Available',
          description: 'Navigate faster with keyboard shortcuts',
          duration: 5000
        });
        localStorage.setItem('hasSeenShortcuts', 'true');
      }, 3000);
    }
  }, [toast]);

  return {
    shortcuts: Object.entries(shortcuts).map(([key, { description }]) => ({ key, description }))
  };
};

export default useKeyboardShortcuts;