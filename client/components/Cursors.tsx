"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useEffect, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";

type User = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
};

type Props = {
  yProvider: LiveblocksYjsProvider;
  editor: MonacoEditor.IStandaloneCodeEditor;
};

export function Cursors({ yProvider, editor }: Props) {
  const others = useOthers();
  const self = useSelf();
  const [decorations, setDecorations] = useState<string[]>([]);

  useEffect(() => {
    if (!editor || !yProvider.awareness) return;

    const awareness = yProvider.awareness;
    
    // Update our cursor position when editor selection changes
    const updateCursor = () => {
      const selection = editor.getSelection();
      const position = editor.getPosition();
      
      if (selection && position) {
        awareness.setLocalStateField("cursor", {
          position: {
            lineNumber: position.lineNumber,
            column: position.column,
          },
          selection: {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          },
          user: self?.info,
          timestamp: Date.now(),
        });
      }
    };

    // Listen to cursor position changes
    const disposable = editor.onDidChangeCursorPosition(updateCursor);
    const selectionDisposable = editor.onDidChangeCursorSelection(updateCursor);

    // Listen to awareness changes and render other cursors
    const renderCursors = () => {
      const otherCursors: MonacoEditor.IModelDeltaDecoration[] = [];
      
      others.forEach((other) => {
        const cursor = other.presence?.cursor;
        const currentFile = other.presence?.currentFile;
        const myCurrentFile = self?.presence?.currentFile;
        
        // Only show cursors for users in the same file
        if (cursor && currentFile === myCurrentFile && other.info) {
          const user = other.info as User;
          
          // Cursor position decoration
          otherCursors.push({
            range: new monaco.Range(
              cursor.position.lineNumber,
              cursor.position.column,
              cursor.position.lineNumber,
              cursor.position.column
            ),
            options: {
              className: `cursor-${user.id}`,
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              beforeContentClassName: `cursor-line cursor-${user.id}`,
              afterContentClassName: `cursor-label cursor-${user.id}`,
            },
          });

          // Selection decoration if different from cursor position
          if (cursor.selection) {
            const { startLineNumber, startColumn, endLineNumber, endColumn } = cursor.selection;
            
            if (
              startLineNumber !== endLineNumber ||
              startColumn !== endColumn
            ) {
              otherCursors.push({
                range: new monaco.Range(
                  startLineNumber,
                  startColumn,
                  endLineNumber,
                  endColumn
                ),
                options: {
                  className: `selection-${user.id}`,
                  stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                },
              });
            }
          }
        }
      });

      const newDecorations = editor.deltaDecorations(decorations, otherCursors);
      setDecorations(newDecorations);
    };

    // Initial render
    renderCursors();

    // Listen to awareness changes
    awareness.on('change', renderCursors);

    // Cleanup
    return () => {
      disposable.dispose();
      selectionDisposable.dispose();
      awareness.off('change', renderCursors);
      editor.deltaDecorations(decorations, []);
    };
  }, [editor, yProvider.awareness, others, self, decorations]);

  // Inject cursor styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      ${others.map((other) => {
        const user = other.info as User;
        const color = user?.color || '#ff0000';
        
        return `
          .cursor-${user?.id} {
            position: relative;
          }
          
          .cursor-line.cursor-${user?.id}::before {
            content: '';
            position: absolute;
            top: 0;
            left: -1px;
            width: 2px;
            height: 1.2em;
            background-color: ${color};
            z-index: 1000;
            animation: blink 1s infinite;
          }
          
          .cursor-label.cursor-${user?.id}::after {
            content: '${user?.name || 'Anonymous'}';
            position: absolute;
            top: -20px;
            left: 0;
            background-color: ${color};
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            white-space: nowrap;
            z-index: 1001;
            pointer-events: none;
          }
          
          .selection-${user?.id} {
            background-color: ${color}33 !important;
          }
        `;
      }).join('\n')}
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [others]);

  return null; // This component only handles cursor rendering
}