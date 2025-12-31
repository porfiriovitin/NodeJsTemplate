import { Router } from "express";
import { DemoController } from "../controllers/demo-controller";

const demoRoutes = Router()
const demoController = new DemoController()

demoRoutes.get("/", demoController.index)

export {demoRoutes}