import { Link } from 'react-router-dom';
export function NotFoundPage() { return <section className="error-page"><p>ROUTE COHERENCE: NONE</p><h1>CLUE NOT PRESENT</h1><p>The requested clue either moved, was gobbled, or was never properly chosen.</p><Link to="/">RETURN TO A KNOWN CLUE</Link></section>; }
