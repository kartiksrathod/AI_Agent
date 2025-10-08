import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['G', 'H'], description: 'Go to Home' },
        { keys: ['G', 'P'], description: 'Go to Papers' },
        { keys: ['G', 'N'], description: 'Go to Notes' },
        { keys: ['G', 'S'], description: 'Go to Syllabus' },
        { keys: ['G', 'F'], description: 'Go to Forum' },
        { keys: ['G', 'U'], description: 'Go to Profile' },
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Open Search', mac: ['⌘', 'K'] },
        { keys: ['Ctrl', 'D'], description: 'Toggle Theme', mac: ['⌘', 'D'] },
        { keys: ['?'], description: 'Show Keyboard Shortcuts' },
        { keys: ['Esc'], description: 'Close Modals/Dialogs' },
      ]
    },
    {
      category: 'Power User',
      items: [
        { keys: ['Ctrl', 'Shift', '?'], description: 'Show All Shortcuts', mac: ['⌘', 'Shift', '?'] },
      ]
    }
  ];

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const KeyBadge = ({ keyName }) => (
    <kbd className="inline-flex items-center justify-center px-2 py-1 text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded shadow-sm min-w-[2rem]">
      {keyName}
    </kbd>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="keyboard-shortcuts-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Keyboard className="h-6 w-6 text-blue-500" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster and work more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide flex items-center space-x-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                <span>{section.category}</span>
              </h3>
              
              <div className="space-y-2 pl-3">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    data-testid={`shortcut-item-${sectionIndex}-${itemIndex}`}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.description}
                    </span>
                    <div className="flex items-center space-x-1">
                      {(isMac && item.mac ? item.mac : item.keys).map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <KeyBadge keyName={key} />
                          {keyIndex < (isMac && item.mac ? item.mac : item.keys).length - 1 && (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start space-x-3">
            <Command className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Pro Tips
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Multi-key shortcuts like "G H" require pressing keys in sequence</li>
                <li>• Shortcuts don't work when typing in input fields (except Escape)</li>
                <li>• Press "?" anytime to toggle this help dialog</li>
                <li>• All shortcuts are case-insensitive</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press <KeyBadge keyName="Esc" /> to close this dialog
          </p>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            data-testid="close-shortcuts-modal"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
