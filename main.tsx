import './browser-compat';
import {createRoot} from 'react-dom/client';
import App from './app/page';
import WelcomeScreen from './components/WelcomeScreen';
import './app/index.css';
createRoot(document.getElementById('root')!).render(<WelcomeScreen><App/></WelcomeScreen>);
