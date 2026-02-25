import { Hono } from 'hono';
import { feedController, postController, indexController, homeController, healthController, settingsController, manageController } from '../controllers/feed.controller';

const app = new Hono();

app.get('/', indexController);
app.get('/home', homeController);
app.get('/health', healthController);
app.get('/settings', settingsController);
app.post('/settings', settingsController);
app.get('/manage', manageController);
app.post('/manage', manageController);
app.get('/r/:subreddit', feedController);
app.get('/r/:subreddit/post/:postId', postController);

export default app;
