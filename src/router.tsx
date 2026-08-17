import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import App from './App';
import { ReelRoute } from './routes/reel/ReelRoute';
import { NotFoundRoute } from './routes/not-found/NotFoundRoute';

const SelectsRoute = lazy(() =>
  import('./routes/selects/SelectsRoute').then((m) => ({ default: m.SelectsRoute })),
);
const CaseStudyRoute = lazy(() =>
  import('./routes/case-study/CaseStudyRoute').then((m) => ({
    default: m.CaseStudyRoute,
  })),
);
const LightTableRoute = lazy(() =>
  import('./routes/light-table/LightTableRoute').then((m) => ({
    default: m.LightTableRoute,
  })),
);
const TimelineRoute = lazy(() =>
  import('./routes/timeline/TimelineRoute').then((m) => ({ default: m.TimelineRoute })),
);
const AboutRoute = lazy(() =>
  import('./routes/about/AboutRoute').then((m) => ({ default: m.AboutRoute })),
);
const ContactRoute = lazy(() =>
  import('./routes/contact/ContactRoute').then((m) => ({ default: m.ContactRoute })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundRoute />,
    children: [
      {
        index: true,
        element: <ReelRoute />,
      },
      {
        path: 'work',
        element: <SelectsRoute />,
      },
      {
        path: 'work/:slug',
        element: <CaseStudyRoute />,
      },
      {
        path: 'stills',
        element: <LightTableRoute />,
      },
      {
        path: 'experience',
        element: <TimelineRoute />,
      },
      {
        path: 'about',
        element: <AboutRoute />,
      },
      {
        path: 'contact',
        element: <ContactRoute />,
      },
      {
        path: '*',
        element: <NotFoundRoute />,
      },
    ],
  },
]);
