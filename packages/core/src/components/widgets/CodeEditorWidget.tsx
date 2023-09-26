import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2';
import { ariaDescribedByIds, FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';

/** The `CodeEditorWidget` is a widget for rendering code editors.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function CodeEditorWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ id, placeholder, value, readonly, autofocus = false }: WidgetProps<T, S, F>) {
  return (
    <CodeMirror
      id={id}
      height='300px'
      value={value ? value : ''}
      editable={true}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        foldGutter: true,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        rectangularSelection: true,
        crosshairCursor: true,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        closeBracketsKeymap: true,
        searchKeymap: true,
        foldKeymap: true,
        completionKeymap: true,
        lintKeymap: true,
      }}
      extensions={[StreamLanguage.define(jinja2)]}
      placeholder={placeholder}
      theme='light'
      readOnly={readonly}
      autoFocus={autofocus}
      aria-describedby={ariaDescribedByIds<T>(id)}
    />
  );
}
