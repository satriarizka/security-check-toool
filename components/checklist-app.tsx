"use client";

import { useEffect, useMemo, useState } from "react";
import { checklist, allItems } from "../data/checklist/security-checklist";
import type { ProjectInfo } from "../types/checklist";

const stateKey = "security-checklist-state";
const projectKey = "security-checklist-project";
const blankProject: ProjectInfo = { projectName: "", reviewer: "", version: "", reviewDate: "" };

function readJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function readProject(value: unknown): ProjectInfo {
  if (!value || typeof value !== "object") return blankProject;
  const saved = value as Record<string, unknown>;
  return {
    projectName: typeof saved.projectName === "string" ? saved.projectName : "",
    reviewer: typeof saved.reviewer === "string" ? saved.reviewer : "",
    version: typeof saved.version === "string" ? saved.version : "",
    reviewDate: typeof saved.reviewDate === "string" ? saved.reviewDate : "",
  };
}

export default function ChecklistApp() {
  const [checked, setChecked] = useState<string[]>([]);
  const [project, setProject] = useState<ProjectInfo>(blankProject);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = readJson<unknown>(stateKey, []);
    setChecked(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string" && allItems.some(item => item.id === id)) : []);
    setProject(readProject(readJson<unknown>(projectKey, blankProject)));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(stateKey, JSON.stringify(checked)); } catch { setMessage("Your browser could not save checklist progress locally."); } }, [checked, ready]);
  useEffect(() => { if (ready) try { localStorage.setItem(projectKey, JSON.stringify(project)); } catch { setMessage("Your browser could not save project information locally."); } }, [project, ready]);
  useEffect(() => {
    if (!confirming) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setConfirming(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirming]);

  const checkedSet = useMemo(() => new Set(checked), [checked]);
  const total = allItems.length;
  const percent = total ? Math.round((checked.length / total) * 100) : 0;
  const query = search.trim().toLowerCase();
  const visible = checklist.map(category => ({ ...category, items: category.items.filter(item => !query || `${category.id} ${category.title} ${item.id} ${item.title} ${item.description ?? ""}`.toLowerCase().includes(query)) })).filter(category => category.items.length > 0);
  const toggle = (id: string) => setChecked(old => old.includes(id) ? old.filter(item => item !== id) : [...old, id]);
  const count = (ids: string[]) => ids.filter(id => checkedSet.has(id)).length;
  const clear = () => { setChecked([]); try { localStorage.removeItem(stateKey); } catch {} setConfirming(false); setMessage("Checklist progress cleared. Project information was kept."); };
  const setField = (field: keyof ProjectInfo, value: string) => setProject(old => ({ ...old, [field]: value }));

  async function generatePdf() {
    setMessage("");
    try {
      const { jsPDF } = await import("jspdf"); const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const width = pdf.internal.pageSize.getWidth(), height = pdf.internal.pageSize.getHeight(); let y = 58;
      const add = (text: string, size = 10, color: [number, number, number] = [36, 48, 65], indent = 0) => { pdf.setFontSize(size); pdf.setTextColor(...color); const lines = pdf.splitTextToSize(text, width - 80 - indent); if (y + lines.length * (size + 4) > height - 54) { pdf.addPage(); y = 54; } pdf.text(lines, 40 + indent, y); y += lines.length * (size + 4) + 6; };
      pdf.setFillColor(15, 23, 42); pdf.rect(0, 0, width, 116, "F"); pdf.setTextColor(255, 255, 255); pdf.setFontSize(22); pdf.text("SECURITY CODING", 40, 54); pdf.text("CHECKLIST REPORT", 40, 82); y = 146;
      add(`Project: ${project.projectName || "Not provided"}`, 11); add(`Developer / Reviewer: ${project.reviewer || "Not provided"}`, 11); add(`Version: ${project.version || "Not provided"}`, 11); add(`Review Date: ${project.reviewDate || "Not provided"}`, 11); y += 12;
      add("CHECKLIST SUMMARY", 14, [15, 118, 110]); add(`Total Items: ${total}     Completed: ${checked.length}     Not Completed: ${total - checked.length}`, 10); add(`Checklist Completion: ${percent}%`, 10); y += 10;
      add("CATEGORY SUMMARY", 14, [15, 118, 110]); checklist.forEach(c => add(`${c.title}: ${count(c.items.map(item => item.id))} / ${c.items.length}`)); y += 8;
      checklist.forEach(category => { add(category.title.toUpperCase(), 13, [15, 118, 110]); category.items.forEach(item => add(`${checkedSet.has(item.id) ? "[x]" : "[ ]"} ${item.title}`, 9, [36, 48, 65], 8)); y += 4; });
      const pages = pdf.getNumberOfPages(); for (let page = 1; page <= pages; page++) { pdf.setPage(page); pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.text("Generated by Security Coding Checklist — manual review record, not a security certification", 40, height - 24); pdf.text(`${page} / ${pages}`, width - 68, height - 24); }
      pdf.save(`${(project.projectName || "security-coding-checklist").replace(/[^a-z0-9-_]/gi, "-")}-report.pdf`);
    } catch { setMessage("The PDF could not be generated. Please try again in a supported browser."); }
  }

  return <main><header className="hero"><div><p className="eyebrow">LOCAL-ONLY MANUAL REVIEW</p><h1>Security Coding Checklist</h1><p>A practical manual checklist for reviewing application security.</p></div><div className="hero-actions"><button className="secondary" onClick={() => setConfirming(true)}>Clear Checklist</button><button className="primary" onClick={generatePdf}>Generate PDF Report</button></div></header>
    <section className="notice">Checklist completion is informational only. It is not a security score or certification.</section>
    {message && <p className="message" role="status">{message}</p>}
    <section className="project card"><h2>Project information <span>Optional</span></h2><div className="fields">{([ ["projectName", "Project Name", "E-Commerce API"], ["reviewer", "Developer / Reviewer", "John Doe"], ["version", "Version", "v1.0.0"], ["reviewDate", "Review Date", ""] ] as const).map(([field,label,placeholder]) => <label key={field}>{label}<input type={field === "reviewDate" ? "date" : "text"} value={project[field]} placeholder={placeholder} onChange={e => setField(field, e.target.value)} /></label>)}</div></section>
    <div className="layout"><aside className="sidebar card"><h2>Checklist Progress</h2><strong>{checked.length} <small>/ {total} completed</small></strong><div className="progress" aria-label={`${checked.length} of ${total} completed`}><i style={{ width: `${percent}%` }} /></div><p>Informational progress only</p><nav aria-label="Checklist categories">{checklist.map(c => <a href={`#${c.id}`} key={c.id}>{c.title}<span>{count(c.items.map(i => i.id))}/{c.items.length}</span></a>)}</nav></aside>
      <section className="checks"><label className="search">Search security checklist...<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by category, item, or rule ID" /></label>{visible.length ? visible.map(category => { const categoryCount = count(category.items.map(i => i.id)); return <article className="category card" id={category.id} key={category.id}><button className="category-head" onClick={() => setCollapsed(old => ({ ...old, [category.id]: !old[category.id] }))} aria-expanded={!collapsed[category.id]}><span>{collapsed[category.id] ? "▶" : "▼"} {category.title}</span><b>{categoryCount} / {category.items.length}</b></button>{!collapsed[category.id] && <div className="items">{category.items.map(item => <label className="item" key={item.id}><input type="checkbox" checked={checkedSet.has(item.id)} onChange={() => toggle(item.id)} /><span><em>{item.id}</em>{item.title}</span></label>)}</div>}</article>; }) : <div className="card empty"><h2>No matching checks</h2><p>Try a broader search term or clear the search field.</p></div>}</section></div>
    {confirming && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setConfirming(false)}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="clear-title" onMouseDown={event => event.stopPropagation()}><h2 id="clear-title">Clear Checklist?</h2><p>This will uncheck all security checklist items and reset saved checklist progress. Project information will remain.</p><div><button className="secondary" autoFocus onClick={() => setConfirming(false)}>Cancel</button><button className="danger" onClick={clear}>Clear</button></div></section></div>}
  </main>;
}
