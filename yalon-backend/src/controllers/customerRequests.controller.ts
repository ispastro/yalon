import { Request, Response } from 'express';
import { createCustomerRequest } from '../services/customerRequests.service';
import { CustomerRequestInput } from '../validators/customerRequest.schema';

export async function submitCustomerRequest(req: Request, res: Response) {
  const input = req.body as CustomerRequestInput;
  const result = await createCustomerRequest(input);

  res.status(201).json({
    success: true,
    message: 'Your service request has been submitted successfully. Our team will contact you shortly with a quotation.',
    id: result.id,
  });
}
