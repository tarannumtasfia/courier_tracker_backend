import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authMiddleware from './utils/auth.js';
import authRoutes from './routes/authRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import { checkForStuckPackages } from './utils/stuckChecker.js';

dotenv.config();
 
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors({
  origin: ['http://localhost:5174','http://localhost:5173', 'http://localhost:3000','https://courier-tracker-frontend-eosin.vercel.app']
}));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});
setInterval(() => {
  checkForStuckPackages(io);
}, 5 * 60 * 1000);


app.use('/api/auth', authRoutes);
app.use('/api/packages', authMiddleware, packageRoutes);

server.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});
