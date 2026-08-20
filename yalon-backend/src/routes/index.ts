import { Router } from 'express';
import { healthRouter } from './health.route';
import { customerRequestsRouter } from './customerRequests.route';
import { employeeApplicationsRouter } from './employeeApplications.route';
import { adminRouter } from './admin.route';

export const router = Router();

router.use('/', healthRouter);
router.use('/api/customer-requests', customerRequestsRouter);
router.use('/api/employee-applications', employeeApplicationsRouter);
router.use('/admin', adminRouter);
