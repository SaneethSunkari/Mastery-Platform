"use client";

import { FormEvent, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";
import { NoteRecord, CourseSlug } from "@/lib/types";

const createNote = (courseSlug: CourseSlug, topic: string, title: string, body: string, isImportant: boolean): NoteRecord => {
  const now = new Date().toISOString();
  return {
    id: `note-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    courseSlug,
    topic,
    title,
    body,
    isImportant,
  };
};

export function NotesView() {
  const notes = useLiveQuery(() => db.notes.orderBy("updatedAt").reverse().toArray(), []);
  const [courseSlug, setCourseSlug] = useState<CourseSlug>("sql");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [important, setImportant] = useState(false);

  const filteredNotes = (notes ?? []).filter((note) => {
    if (!query.trim()) return true;
    const haystack = `${note.title} ${note.topic} ${note.body}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim() || !topic.trim()) return;
    await db.notes.put(createNote(courseSlug, topic.trim(), title.trim(), body.trim(), important));
    setTopic("");
    setTitle("");
    setBody("");
    setImportant(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Notes</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          Capture lesson notes, code snippets, mental models, and mistakes. Everything stays local and can be exported from settings.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">New note</CardTitle>
            <CardDescription>Attach notes to SQL, Python, or PySpark topics and mark the important ones for faster review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span>Course</span>
                  <select
                    value={courseSlug}
                    onChange={(event) => setCourseSlug(event.target.value as CourseSlug)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  >
                    <option value="sql">SQL</option>
                    <option value="python">Python</option>
                    <option value="pyspark">PySpark</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span>Topic</span>
                  <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Joins, Functions, Testing..." />
                </label>
              </div>
              <label className="space-y-2 text-sm">
                <span>Title</span>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What I keep forgetting about left joins" />
              </label>
              <label className="space-y-2 text-sm">
                <span>Body</span>
                <Textarea
                  rows={8}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write a clean explanation, a code pattern, or a postmortem for a mistake."
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={important} onChange={(event) => setImportant(event.target.checked)} />
                Mark as important
              </label>
              <Button type="submit">Save note</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="font-heading text-xl">Saved notes</CardTitle>
                <CardDescription>Search by title, topic, or content.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No notes yet. Add one from a lesson, an exercise mistake, or a project insight.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="rounded-3xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {note.courseSlug.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{note.topic}</span>
                    {note.isImportant ? (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-200">
                        Important
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 font-medium">{note.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {note.body}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
