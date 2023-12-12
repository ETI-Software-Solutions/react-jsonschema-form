import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { StreamLanguage, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { beautifyJinja } from '@etisoftware/jinja2-beautify';
import {
  ariaDescribedByIds,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@etisoftware/rjsf-utils';
import { EditorState, basicSetup } from '@codemirror/basic-setup';

/** The `CodeEditorWidget` is a widget for rendering code editors.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function CodeEditorWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ id, value, readonly = false, onChange }: WidgetProps<T, S, F>) {
  const chalky = '#353a42',
    coral = '#235066',
    cyan = '#348690',
    invalid = '#ffffff',
    ivory = '#6e7a90',
    stone = '#565e6d',
    malibu = '#167fd6',
    sage = '#689944',
    whiskey = '#a76b32',
    violet = '#9e30bf',
    darkBackground = '#8a919966',
    highlightBackground = '#8a91991a',
    background = '#fcfcfc',
    tooltipBackground = '#353a42',
    selection = '#036dd626',
    cursor = '#000';

  const customTheme = EditorView.theme(
    {
      '&': {
        color: ivory,
        backgroundColor: background,
      },
      '.cm-content': {
        caretColor: cursor,
      },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        { backgroundColor: selection },
      '.cm-panels': { backgroundColor: darkBackground, color: ivory },
      '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
      '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },
      '.cm-searchMatch': {
        backgroundColor: '#72a1ff59',
        outline: '1px solid #457dff',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: '#6199ff2f',
      },
      '.cm-activeLine': { backgroundColor: '#8a91991a' },
      '.cm-selectionMatch': { backgroundColor: '#aafe661a' },
      '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
        backgroundColor: '#bad0f847',
      },
      '.cm-gutters': {
        backgroundColor: background,
        color: stone,
        borderRight: '1px solid #ccc',
      },
      '.cm-activeLineGutter': {
        backgroundColor: highlightBackground,
      },
      '.cm-foldPlaceholder': {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ddd',
      },
      '.cm-tooltip': {
        border: 'none',
        backgroundColor: tooltipBackground,
      },
      '.cm-tooltip .cm-tooltip-arrow:before': {
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
      },
      '.cm-tooltip .cm-tooltip-arrow:after': {
        borderTopColor: tooltipBackground,
        borderBottomColor: tooltipBackground,
      },
      '.cm-tooltip-autocomplete': {
        '& > ul > li[aria-selected]': {
          backgroundColor: highlightBackground,
          color: ivory,
        },
      },
    },
    { dark: false }
  );

  const customThemeHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: violet },
    { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName], color: coral },
    { tag: [tags.function(tags.variableName), tags.labelName], color: malibu },
    { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: whiskey },
    { tag: [tags.definition(tags.name), tags.separator], color: ivory },
    {
      tag: [
        tags.typeName,
        tags.className,
        tags.number,
        tags.changed,
        tags.annotation,
        tags.modifier,
        tags.self,
        tags.namespace,
      ],
      color: chalky,
    },
    {
      tag: [
        tags.operator,
        tags.operatorKeyword,
        tags.url,
        tags.escape,
        tags.regexp,
        tags.link,
        tags.special(tags.string),
      ],
      color: cyan,
    },
    { tag: [tags.meta, tags.comment], color: stone },
    { tag: tags.strong, fontWeight: 'bold' },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.strikethrough, textDecoration: 'line-through' },
    { tag: tags.link, color: stone, textDecoration: 'underline' },
    { tag: tags.heading, fontWeight: 'bold', color: coral },
    { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: whiskey },
    { tag: [tags.processingInstruction, tags.string, tags.inserted], color: sage },
    { tag: tags.invalid, color: invalid },
  ]);

  const editorRef = useRef(null);
  const [anchor, setAnchor] = useState(0);

  const handleOnChange = useCallback(
    (value) => {
      onChange(value);
    },
    [onChange]
  );

  const lightTheme = [customTheme, syntaxHighlighting(customThemeHighlightStyle)];
  const startState = EditorState.create({
    doc: beautifyJinja(value),
    extensions: [
      basicSetup,
      keymap.of([...defaultKeymap, indentWithTab]),
      EditorState.readOnly.of(readonly),
      StreamLanguage.define(jinja2),
      lightTheme,
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          const currentValue = beautifyJinja(v.view.state.doc.toString());
          if (v.view && value !== currentValue) {
            setAnchor(v.view.state.selection.main.anchor);
            handleOnChange(currentValue);
            v.view.dispatch({
              changes: { from: 0, insert: currentValue },
            });
          }
        }
      }),
    ],
  });

  useEffect(() => {
    if (editorRef.current === null) {
      return;
    }

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    if (!view.hasFocus) {
      view.focus();
      view.dispatch({
        selection: {
          anchor: Math.min(view.state.doc.toString().length, anchor),
        },
      });
    }

    return () => {
      view.destroy();
    };
  }, [anchor, startState]);

  return (
    <div
      id={id}
      ref={editorRef}
      style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
      aria-describedby={ariaDescribedByIds(id)}
    />
  );
}
