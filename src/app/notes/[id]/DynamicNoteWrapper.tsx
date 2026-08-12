'use client';

import dynamic from 'next/dynamic';

const NoteClient = dynamic(() => import('../../components/NoteClient'), { ssr: false });

import { Note } from '@/types';

export default function DynamicNoteWrapper(props: { initialNote: Note }) {
  return <NoteClient {...props} />;
}
