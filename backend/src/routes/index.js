import express from 'express'
import Userrouter from './usersRoutes.js';
import PostsRouter from './postsRoutes.js';
import ContactRouter from './contactRoutes.js';
import NotificationRouter from './notificationRoutes.js';
import CommentRouter from './commentRoutes.js';
import AuthRouter from './authRoutes.js';
import ReportRouter from './reportRoutes.js';
import SettingsRouter from './settingsRoutes.js';
import CategoriesRouter from './categoriesRoutes.js';

const Router = express.Router()

Router.use('/user', Userrouter)
Router.use('/posts', PostsRouter)
Router.use('/contact', ContactRouter)
Router.use('/notifications', NotificationRouter)
Router.use('/comments', CommentRouter)
Router.use('/auth', AuthRouter)
Router.use('/reports', ReportRouter)
Router.use('/settings', SettingsRouter)
Router.use('/categories', CategoriesRouter)

export default Router
