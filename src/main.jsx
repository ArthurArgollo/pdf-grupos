import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PDFDocument } from 'pdf-lib';
import { FilePlus2, Files, FolderPlus, GripVertical, Download, Trash2, Pencil, Check, X, ShieldCheck, ArrowDownUp, Sparkles, Sun, Moon } from 'lucide-react';
import { addFileToGroup, downloadName, getUngrouped, moveFile, removeFileFromGroups } from './grouping.js';
import './styles.css';

const colors = ['violet', 'teal', 'amber', 'rose', 'blue'];
const newGroup = (n) => ({ id: crypto.randomUUID(), name: `Grupo ${n}`, files: [], color: colors[(n - 1) % colors.length] });

function openFileStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pdf-grupos-files', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function App() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [groups, setGroups] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('pdf-grupos-groups') || 'null'); return Array.isArray(saved) && saved.length ? saved.map((g) => ({ ...g, files: [] })) : [newGroup(1)]; } catch { return [newGroup(1)]; }
  });
  const [dragging, setDragging] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [progress, setProgress] = useState('');
  const [previousGroups, setPreviousGroups] = useState(null);
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('pdf-grupos-theme') === 'light');
  const [showAbout, setShowAbout] = useState(false);
  const ungrouped = useMemo(() => getUngrouped(files, groups), [files, groups]);
  useEffect(() => { localStorage.setItem('pdf-grupos-groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { openFileStore().then((db) => { const request = db.transaction('files').objectStore('files').getAll(); request.onsuccess = () => { setFiles(request.result || []); setFilesLoaded(true); }; }).catch(() => setFilesLoaded(true)); }, []);
  useEffect(() => { if (!filesLoaded) return; openFileStore().then((db) => { const transaction = db.transaction('files', 'readwrite'); const store = transaction.objectStore('files'); store.clear(); files.forEach((item) => store.put(item)); }).catch(() => {}); }, [files, filesLoaded]);

  function addFiles(eventOrFiles) {
    const selected = Array.from(eventOrFiles?.target?.files || eventOrFiles || []);
    const pdfs = selected.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (selected.length !== pdfs.length) setNotice('Apenas arquivos PDF foram adicionados.');
    setFiles((current) => {
      const known = new Set(current.map(({ file }) => `${file.name}|${file.size}|${file.lastModified}`));
      const unique = pdfs.filter((file) => !known.has(`${file.name}|${file.size}|${file.lastModified}`));
      if (unique.length !== pdfs.length) setNotice('Alguns PDFs ja estavam na lista e nao foram duplicados.');
      return [...current, ...unique.map((file) => ({ id: crypto.randomUUID(), file }))];
    });
    if (eventOrFiles?.target) eventOrFiles.target.value = '';
  }
  function handleDrop(event) { event.preventDefault(); if (!event.target.closest('.group-card')) addFiles(event.dataTransfer.files); }
  function updateGroups(updater) { setGroups((current) => { setPreviousGroups(current); return updater(current); }); }
  const createGroup = () => setGroups((current) => [...current, newGroup(current.length + 1)]);
  function removeFile(id) { setFiles((current) => current.filter((item) => item.id !== id)); updateGroups((current) => removeFileFromGroups(current, id)); }
  function addToGroup(fileId, groupId) { updateGroups((current) => addFileToGroup(current, fileId, groupId)); }
  function moveWithin(groupId, index, direction) { updateGroups((current) => moveFile(current, groupId, index, direction)); }
  function rename(id, name) { updateGroups((current) => current.map((g) => g.id === id ? { ...g, name: name.trim() || g.name } : g)); setEditing(null); }
  function removeGroup(id) { updateGroups((current) => current.filter((group) => group.id !== id)); setNotice('Grupo removido. Os arquivos ficaram disponiveis em Arquivos soltos.'); }
  function undo() { if (previousGroups) { setGroups(previousGroups); setPreviousGroups(null); setNotice('Ultima alteracao desfeita.'); } }
  async function mergeGroup(group) {
    const output = await PDFDocument.create();
    for (let index = 0; index < group.files.length; index += 1) { const id = group.files[index]; const source = files.find((item) => item.id === id)?.file; if (!source) continue; setProgress(`Lendo ${index + 1} de ${group.files.length}...`); const sourcePdf = await PDFDocument.load(await source.arrayBuffer()); const pages = await output.copyPages(sourcePdf, sourcePdf.getPageIndices()); pages.forEach((page) => output.addPage(page)); }
    const url = URL.createObjectURL(new Blob([await output.save()], { type: 'application/pdf' })); const link = document.createElement('a'); link.href = url; link.download = downloadName(group.name); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function downloadOne(group) { setBusy(true); setNotice('Gerando seu arquivo...'); try { await mergeGroup(group); setNotice('Arquivo gerado com sucesso.'); } catch { setNotice('Não foi possível ler este PDF. Verifique se ele não está protegido.'); } finally { setBusy(false); } }
  async function downloadAll() { const ready = groups.filter((g) => g.files.length); if (!ready.length) return; setBusy(true); setNotice('Gerando seus arquivos...'); try { for (let index = 0; index < ready.length; index += 1) { setProgress(`Grupo ${index + 1} de ${ready.length}`); await mergeGroup(ready[index]); } setNotice(`${ready.length} arquivo(s) gerado(s) com sucesso.`); } catch { setNotice('Não foi possível ler um dos PDFs. Verifique se ele não está protegido.'); } finally { setBusy(false); setProgress(''); } }

  useEffect(() => {
    localStorage.setItem('pdf-grupos-theme', lightMode ? 'light' : 'dark');
    document.body.classList.toggle('light-mode', lightMode);
  }, [lightMode]);
  return <div className={`app-shell ${lightMode ? 'light-mode' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Files size={19} /></span><span>pdf<span className="brand-accent">grupos</span></span></div>
      <div className="topbar-actions">
        <div className="privacy"><ShieldCheck size={16} /> <span>seus arquivos ficam no navegador</span></div>
        <button
          className={`theme-toggle ${lightMode ? 'is-light' : 'is-dark'}`}
          onClick={() => setLightMode((value) => !value)}
          aria-label={lightMode ? 'Ativar modo escuro' : 'Ativar modo claro'}
          title={lightMode ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-icon sun"><Sun size={13} /></span>
            <span className="theme-toggle-icon moon"><Moon size={13} /></span>
            <span className="theme-toggle-thumb" />
          </span>
          <span className="theme-toggle-label">{lightMode ? 'Claro' : 'Escuro'}</span>
        </button>
        <button className="header-button" onClick={() => setShowAbout(true)}>Sobre</button>
      </div>
    </header>
    <main className="content">
      <section className="hero"><div><div className="eyebrow"><Sparkles size={14} /> ORGANIZE DO SEU JEITO</div><h1>Junte PDFs em<br /><em>grupos separados.</em></h1><p>Monte vários blocos de arquivos e baixe cada combinação como um PDF independente.</p></div><div className="hero-orb"><span>01</span><span>+</span><span>02</span><i>&rarr;</i><strong>PDF</strong></div></section>
      <section className="upload-card"><div className="upload-icon"><FilePlus2 size={25} /></div><div><h2>Comece adicionando seus PDFs</h2><p>Você pode selecionar vários arquivos de uma só vez.</p></div><button className="primary" onClick={() => inputRef.current?.click()}>Selecionar PDFs <span aria-hidden="true">↗</span></button><input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={addFiles} /></section>
      {files.length === 0 ? <section className="empty"><div className="empty-illustration"><span>PDF</span><span>PDF</span><span>PDF</span></div><h2>Seu espaço de organização</h2><p>Adicione arquivos para começar a criar seus grupos.</p><div className="tip"><Sparkles size={15} /> Exemplo: coloque os PDFs 1 e 2 no Grupo 1 e os PDFs 3 e 4 no Grupo 2.</div></section> : <>
        <div className="workspace-head"><div><div className="section-kicker">ÁREA DE TRABALHO</div><h2>Separe seus arquivos em blocos</h2></div><div className="stats"><span><b>{files.length}</b> arquivos</span><span><b>{groups.filter((g) => g.files.length).length}</b> grupos prontos</span></div></div>
        <div className="board">{groups.map((group, groupIndex) => <section key={group.id} className={`group-card ${group.color}`} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragging) addToGroup(dragging, group.id); setDragging(null); }}>
          <div className="group-head"><div className="group-title"><span className="group-number">{String(groupIndex + 1).padStart(2, '0')}</span>{editing === group.id ? <input autoFocus defaultValue={group.name} onBlur={(e) => rename(group.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && rename(group.id, e.target.value)} /> : <h3>{group.name}</h3>}<button className="icon-button" aria-label={'Renomear ' + group.name} onClick={() => setEditing(group.id)} title="Renomear"><Pencil size={14} /></button><button className="icon-button" aria-label={'Excluir ' + group.name} onClick={() => removeGroup(group.id)} title="Excluir grupo"><Trash2 size={14} /></button></div><span className="count">{group.files.length} {group.files.length === 1 ? 'arquivo' : 'arquivos'}</span></div>
          <div className="group-files">{group.files.length ? group.files.map((id, index) => { const item = files.find((file) => file.id === id); if (!item) return null; return <div className="file-row" key={id} draggable onDragStart={() => setDragging(id)} onDragEnd={() => setDragging(null)}><GripVertical className="grip" size={16} /><span className="pdf-badge">PDF</span><span className="file-name" title={item.file.name}>{item.file.name}</span><span className="file-size">{(item.file.size / 1024 / 1024).toFixed(1)} MB</span><button className="tiny-button" aria-label="Mover para cima" onClick={() => moveWithin(group.id, index, -1)} disabled={index === 0}>&uarr;</button><button className="tiny-button" aria-label="Mover para baixo" onClick={() => moveWithin(group.id, index, 1)} disabled={index === group.files.length - 1}>&darr;</button><button className="delete-button" aria-label={'Remover ' + item.file.name} onClick={() => removeFile(id)}><X size={15} /></button></div>; }) : <div className="drop-zone"><FolderPlus size={22} /><span>Arraste arquivos aqui</span></div>}</div>
          <div className="group-foot"><button className="add-to-group" onClick={() => inputRef.current?.click()}>+ Adicionar PDFs</button>{group.files.length > 0 && <button className="download-one" disabled={busy} onClick={() => downloadOne(group)}><Download size={15} /> Baixar grupo</button>}</div>
        </section>)}<button className="new-group" onClick={createGroup}><span><FolderPlus size={20} /></span><b>Novo grupo</b><small>para outro PDF final</small></button></div>
        {ungrouped.length > 0 && <section className="loose"><div className="loose-head"><div><div className="section-kicker">AINDA SEM GRUPO</div><h2>Arquivos soltos</h2></div><span>Arraste cada item para um grupo</span></div><div className="loose-list">{ungrouped.map(({ id, file }) => <div className="file-row loose-row" draggable onDragStart={() => setDragging(id)} onDragEnd={() => setDragging(null)} key={id}><GripVertical className="grip" size={16} /><span className="pdf-badge">PDF</span><span className="file-name" title={file.name}>{file.name}</span><span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span><button className="delete-button" aria-label={'Remover ' + file.name} onClick={() => removeFile(id)}><Trash2 size={15} /></button></div>)}</div></section>}
        <div className="action-bar"><div><span className="action-icon"><ArrowDownUp size={18} /></span><div><strong>Tudo pronto?</strong><small>{progress || 'Cada grupo vira um PDF independente.'}</small></div></div><div className="action-buttons"><button className="secondary" disabled={!previousGroups || busy} onClick={undo}>Desfazer</button><button className="primary big" disabled={busy || !groups.some((g) => g.files.length)} onClick={downloadAll}>{busy ? 'Gerando...' : 'Baixar todos os grupos'} <Download size={17} /></button></div></div>
        {notice && <div className="notice" role="status"><Check size={16} /> {notice}</div>}
      </>}
    </main><footer>pdfgrupos <span>&bull;</span> simples, privado e feito para organizar seu trabalho</footer>
    {showAbout && <div className="modal-backdrop" onClick={() => setShowAbout(false)}><section className="about-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowAbout(false)} aria-label="Fechar">×</button><div className="brand-mark"><Files size={19} /></div><h2>Sobre o PDF Grupos</h2><p>Organize, combine e baixe seus PDFs com privacidade. Seus arquivos ficam armazenados localmente no navegador.</p><small>Versão 1.0.0</small></section></div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
