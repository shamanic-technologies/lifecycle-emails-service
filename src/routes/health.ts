import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Health check'
  // #swagger.description = 'Returns service health status'
  /* #swagger.responses[200] = {
    description: 'Service is healthy',
    schema: { $ref: '#/definitions/HealthResponse' }
  } */
  res.json({ status: "ok", service: "lifecycle-emails-service" });
});

export default router;
