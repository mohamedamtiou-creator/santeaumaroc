"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback } from "react";

type Props = { content: string; onChange: (html: string) => void };

export function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary-600 underline hover:text-primary-800" },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full mx-auto my-4 block" },
      }),
      Placeholder.configure({ placeholder: "Commencez à rédiger votre article de santé…" }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-prose min-h-[420px] outline-none px-6 py-5 text-slate-800",
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien :", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de l'image :", "https://");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="border border-slate-200 rounded-xl animate-pulse bg-slate-50 h-64" />;
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-shadow">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50/80">
        <ToolBtn active={editor.isActive("bold")}      onClick={() => editor.chain().focus().toggleBold().run()}             title="Gras (Ctrl+B)">B</ToolBtn>
        <ToolBtn active={editor.isActive("italic")}    onClick={() => editor.chain().focus().toggleItalic().run()}           title="Italique (Ctrl+I)" cls="italic">I</ToolBtn>
        <ToolBtn active={editor.isActive("strike")}    onClick={() => editor.chain().focus().toggleStrike().run()}           title="Barré"><span className="line-through">S</span></ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre H2">H2</ToolBtn>
        <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre H3">H3</ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("bulletList")}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Liste à puces">
          <ListIcon />
        </ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
          <OListIcon />
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 3h4v5H5a2 2 0 0 0 2 2v2a4 4 0 0 1-4-4V3zm6 0h4v5h-2a2 2 0 0 0 2 2v2a4 4 0 0 1-4-4V3z"/></svg>
        </ToolBtn>
        <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne de séparation">—</ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("link")} onClick={addLink} title="Lien">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9a3 3 0 0 0 4.5.5l1.5-1.5a3 3 0 0 0-4-4.5L7 4.5"/>
            <path d="M10 7a3 3 0 0 0-4.5-.5L4 8a3 3 0 0 0 4 4.5L9 11.5"/>
          </svg>
        </ToolBtn>
        <ToolBtn active={false} onClick={addImage} title="Image">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="14" height="10" rx="1.5"/>
            <circle cx="5.5" cy="6.5" r="1"/>
            <path d="m1 10 3.5-3.5 3 3 2-2 4.5 4.5"/>
          </svg>
        </ToolBtn>
        <Divider />
        <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7H11a3 3 0 0 1 0 6H8"/><path d="m1 5 2-2 2 2"/>
          </svg>
        </ToolBtn>
        <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7H5a3 3 0 0 0 0 6h3"/><path d="m15 5-2-2-2 2"/>
          </svg>
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolBtn({
  active, onClick, title, children, cls = "",
}: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode; cls?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      aria-label={title}
      className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-colors ${cls} ${
        active
          ? "bg-primary-100 text-primary-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" aria-hidden="true" />;
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" strokeLinecap="round">
      <path d="M6 4h7M6 8h7M6 12h7M3 4h.01M3 8h.01M3 12h.01"/>
    </svg>
  );
}

function OListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <text x="1" y="5" fontSize="4.5" fontFamily="sans-serif">1.</text>
      <text x="1" y="9.5" fontSize="4.5" fontFamily="sans-serif">2.</text>
      <text x="1" y="14" fontSize="4.5" fontFamily="sans-serif">3.</text>
      <rect x="7" y="2.5" width="8" height="1" rx=".5"/>
      <rect x="7" y="7" width="8" height="1" rx=".5"/>
      <rect x="7" y="11.5" width="8" height="1" rx=".5"/>
    </svg>
  );
}
