import React from 'react';
import { Tag, Folder } from '@/types';
import { COLOR_MAP } from '@/constants/theme';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedSidebarTag: Tag | null;
  selectedFolder: Folder | null;
  onOpenFolderModal: () => void;
  onOpenNoteModal: () => void;
  onNavigateUp: () => void;
  onDropToParent?: (e: React.DragEvent) => void;
}

export function DashboardHeader({
  searchQuery, setSearchQuery, selectedSidebarTag, selectedFolder,
  onOpenFolderModal, onOpenNoteModal, onNavigateUp, onDropToParent
}: DashboardHeaderProps) {
  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
        <div className="flex-1 max-w-lg relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" placeholder="Pesquisar..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-4/50 border border-brand-4 rounded-full pl-12 pr-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-3 transition-all shadow-sm text-brand-1 placeholder-brand-2"
          />
        </div>
        <div className="flex items-center gap-4">
          {!selectedSidebarTag && (
            <button onClick={onOpenFolderModal} className="bg-brand-4 border border-brand-3/30 hover:bg-brand-3/80 text-brand-1 font-bold py-3 px-6 rounded-full shadow-sm transition-all duration-200 text-sm">
              Nova Pasta
            </button>
          )}
          <button onClick={onOpenNoteModal} className="bg-brand-2 hover:bg-brand-1 text-brand-5 font-bold py-3 px-7 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-sm transform hover:-translate-y-0.5">
            Nova Nota
          </button>
        </div>
      </header>

      <div className="mb-10 flex items-center gap-4">
        {selectedFolder && !selectedSidebarTag && (
          <button 
            onClick={onNavigateUp} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-4 border border-brand-3/30 text-brand-2 hover:text-brand-1 shadow-sm transition-colors"
            onDragOver={onDropToParent ? e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('ring-2', 'ring-brand-2'); } : undefined}
            onDragLeave={onDropToParent ? e => e.currentTarget.classList.remove('ring-2', 'ring-brand-2') : undefined}
            onDrop={onDropToParent ? e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2', 'ring-brand-2'); onDropToParent(e); } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        )}
        <h2 className="text-4xl font-black tracking-tight text-brand-1 flex items-center gap-4">
          {selectedSidebarTag ? (
            <><div className={`w-5 h-5 rounded-full shadow-md ${COLOR_MAP[selectedSidebarTag.color]}`}></div> Tag: {selectedSidebarTag.name}</>
          ) : (
            selectedFolder ? selectedFolder.name : 'Overview'
          )}
        </h2>
      </div>
    </>
  );
}
