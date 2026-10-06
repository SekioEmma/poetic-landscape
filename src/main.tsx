import {createRoot} from 'react-dom/client';
import App from './App';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import './exploration.css';
createRoot(document.getElementById('root')!).render(<App/>);
