import { Request, Response } from 'express';
import { createEmployeeApplication } from '../services/employeeApplications.service';
import { EmployeeApplicationInput } from '../validators/employeeApplication.schema';

export async function submitEmployeeApplication(req: Request, res: Response) {
  const input = req.body as EmployeeApplicationInput;
  const files = (req.files as Record<string, Express.Multer.File[]>) || {};

  const result = await createEmployeeApplication(input, files);

  res.status(201).json({
    success: true,
    message: 'Your application has been submitted successfully. We will review it and get in touch.',
    id: result.id,
  });
}
