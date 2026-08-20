"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Unlink, ImageIcon,
  Undo, Redo, Minus,
  Highlighter, Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon, Code, CodeSquare,
  Table as TableIcon, Trash2, Columns3, Rows3,
  ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, ArrowDownToLine,
  Merge, Split, Heading as HeadingIcon, Pilcrow,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
}

export function TipTapEditor({
  value,
  onChange,
  onImageUpload,
  disabled = false,
  minHeight = "400px",
  maxHeight = "600px",
  placeholder = "Start writing your blog post...",
}: TipTapEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const rawHtmlRef = useRef<string>(value);
  const initializedRef = useRef(false);
  const [, forceRerender] = useState(0);
  const activeStateRef = useRef<string>("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      transformPastedHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll("b[id^='docs-internal-guid']").forEach((el) => {
          el.replaceWith(...Array.from(el.childNodes));
        });

        doc.querySelectorAll("table, td, th, col, colgroup").forEach((el) => {
          el.removeAttribute("width");
          el.removeAttribute("colwidth");
          const style = el.getAttribute("style") || "";
          const cleaned = style
            .split(";")
            .filter((s) => {
              const prop = s.trim().toLowerCase();
              return (
                prop !== "" &&
                !prop.startsWith("width") &&
                !prop.startsWith("min-width") &&
                !prop.startsWith("max-width")
              );
            })
            .join(";");
          cleaned.trim()
            ? el.setAttribute("style", cleaned)
            : el.removeAttribute("style");
        });

        return doc.body.innerHTML;
      },
    },
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || isHtmlMode) return;
    if (!initializedRef.current) {
      rawHtmlRef.current = value;
      initializedRef.current = true;
    }
    const isSame = editor.getHTML() === value || (!value && editor.isEmpty);
    if (!isSame) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor, isHtmlMode]);

      // Toolbar buttons (Bold, Italic, etc.) need to reflect active state even
  // when toggled with no text selected, which doesn't trigger onUpdate.
  // To do this safely (without an infinite loop), we compute a small
  // fingerprint of the marks we actually render buttons for, and only
  // call setState when that fingerprint has genuinely changed.
  useEffect(() => {
    if (!editor) return;

    const trackedMarks = [
      "bold", "italic", "underline", "strike",
      "highlight", "superscript", "subscript", "code",
    ];

    const checkActiveState = () => {
      const fingerprint = trackedMarks
        .map((mark) => (editor.isActive(mark) ? "1" : "0"))
        .join("");

      if (fingerprint !== activeStateRef.current) {
        activeStateRef.current = fingerprint;
        forceRerender((n) => n + 1);
      }
    };

    editor.on("transaction", checkActiveState);
    return () => {
      editor.off("transaction", checkActiveState);
    };
  }, [editor]);

  if (!editor) return null;

  const handleImageInsert = async (file: File) => {
    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      console.error("Image upload failed", e);
    }
  };

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const text = editor.getText();
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  const formatHtml = (html: string): string => {
    let formatted = "";
    let indent = 0;
    const tab = "  ";
    const voidElements = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
    const inlineElements = new Set(["a","abbr","acronym","b","bdo","big","br","cite","code","dfn","em","i","img","input","kbd","label","map","object","output","q","samp","select","small","span","strong","sub","sup","textarea","time","tt","var"]);

    html
      .replace(/>\s*</g, "><")
      .replace(/(<\/?)(\w+)([^>]*)>/g, "$1$2$3>")
      .split(/(?=<)|(?<=>)/)
      .forEach((token) => {
        if (!token.trim()) return;
        const isClosing = /^<\//.test(token);
        const isSelfClosing = /\/>$/.test(token) || voidElements.has((token.match(/^<(\w+)/) || [])[1]?.toLowerCase() || "");
        const tagName = ((token.match(/^<\/?(\w+)/) || [])[1] || "").toLowerCase();
        const isInline = inlineElements.has(tagName);
        const isOpening = /^<[^/]/.test(token) && !isSelfClosing;

        if (isClosing && !isInline) indent = Math.max(0, indent - 1);
        formatted += (isInline ? "" : "\n" + tab.repeat(indent)) + token;
        if (isOpening && !isInline) indent++;
      });

    return formatted.trim();
  };

  const ToolbarButton = ({
    onClick, active, title, children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-brand-purple-light transition-colors ${
        active ? "bg-brand-purple-light text-brand-purple-dark" : "text-brand-grey"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-brand-purple/15 mx-1" />;

  return (
    <>
      {!isHtmlMode && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => editor.isActive("table")}
          options={{ placement: "top" }}
          className="flex flex-wrap items-center gap-0.5 p-1 rounded-lg border border-brand-purple/15 bg-white shadow-md"
        >
          <ToolbarButton title="Add Column Before" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <ArrowLeftToLine className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <ArrowRightToLine className="h-4 w-4" />
          </ToolbarButton>
          <button
            type="button"
            title="Delete Column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
          >
            <Columns3 className="h-4 w-4" />
          </button>

          <Divider />

          <ToolbarButton title="Add Row Before" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <ArrowUpToLine className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Add Row After" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <ArrowDownToLine className="h-4 w-4" />
          </ToolbarButton>
          <button
            type="button"
            title="Delete Row"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
          >
            <Rows3 className="h-4 w-4" />
          </button>

          <Divider />

          <ToolbarButton title="Merge Cells" onClick={() => editor.chain().focus().mergeCells().run()}>
            <Merge className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Split Cell" onClick={() => editor.chain().focus().splitCell().run()}>
            <Split className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Toggle Header Row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
            <HeadingIcon className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <button
            type="button"
            title="Delete Table"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}
      <style>{`
      .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: #5b2d8e;
        cursor: col-resize;
        z-index: 20;
        opacity: 0;
        transition: opacity 0.15s;
      }
      td:hover .column-resize-handle,
      th:hover .column-resize-handle,
      .column-resize-handle:hover,
      .selectedColumn .column-resize-handle {
        opacity: 1;
      }
      .resize-cursor {
        cursor: col-resize;
      }
    `}</style>
      <div className="border border-brand-purple/15 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-brand-purple/15 bg-brand-purple-light/30 sticky top-0 z-10">

          <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}>
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 4" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive("heading", { level: 4 })}>
            <Heading4 className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")}>
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")}>
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")}>
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
            <CodeSquare className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Insert Link" onClick={setLink} active={editor.isActive("link")}>
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}>
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}
          <ToolbarButton title="Insert Image" onClick={() => fileRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageInsert(file);
              e.target.value = "";
            }}
          />

          <Divider />

          <ToolbarButton
            title="Insert Table"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            active={editor.isActive("table")}
          >
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            title={isHtmlMode ? "Switch to Visual Editor" : "Edit HTML Source"}
            onClick={() => {
              if (isHtmlMode) {
                editor.commands.setContent(value, { emitUpdate: false });
                setIsHtmlMode(false);
              } else {
                rawHtmlRef.current = formatHtml(rawHtmlRef.current);
                setIsHtmlMode(true);
              }
            }}
            active={isHtmlMode}
          >
            <span className="text-xs font-mono font-bold px-0.5">&lt;/&gt;</span>
          </ToolbarButton>
        </div>

        {/* Editor area */}
        {isHtmlMode ? (
          <CodeMirror
            value={rawHtmlRef.current}
            height={minHeight}
            extensions={[html()]}
            theme={oneDark}
            onChange={(val) => {
              rawHtmlRef.current = val;
              onChange(val);
            }}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              autocompletion: true,
              bracketMatching: true,
              closeBrackets: true,
            }}
          />
        ) : (
        <EditorContent
          editor={editor}
          style={{ minHeight, maxHeight }}
          className="prose prose-sm max-w-none p-4 overflow-y-auto focus-within:outline-none text-brand-purple-dark
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-brand-purple-dark [&_.ProseMirror_h1]:my-3
            [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-brand-purple-dark [&_.ProseMirror_h2]:my-2
            [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:text-brand-purple-dark [&_.ProseMirror_h3]:my-2
            [&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:font-bold [&_.ProseMirror_h4]:text-brand-purple-dark [&_.ProseMirror_h4]:my-2
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-brand-grey/50
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_a]:text-brand-purple [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer
            [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full
            [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-brand-purple/20
            [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-brand-grey
            [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6
            [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
            [&_.ProseMirror_li]:text-brand-purple-dark [&_.ProseMirror_li]:leading-7
            [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:my-4
            [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-brand-purple/20 [&_.ProseMirror_th]:bg-brand-purple-light
            [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-semibold
            [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-brand-purple/20 [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2
            [&_.ProseMirror_mark]:bg-yellow-200 [&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:px-0.5
            [&_.ProseMirror_code]:bg-brand-purple-light [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1
            [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-brand-orange
            [&_.ProseMirror_pre]:bg-brand-purple-dark [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-4
            [&_.ProseMirror_pre_code]:text-white [&_.ProseMirror_pre_code]:text-sm [&_.ProseMirror_pre_code]:font-mono [&_.ProseMirror_pre_code]:bg-transparent
          "
        />
        )}

        {/* Word / char count */}
        <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-brand-purple/15 bg-brand-purple-light/20 text-xs text-brand-grey">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </>
  );
}