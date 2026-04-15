import { getJournalEntries } from './entries';
import BookViewer from './BookViewer';

export default function BookPage() {
  const entries = getJournalEntries();

  return <BookViewer entries={entries} />;
}
