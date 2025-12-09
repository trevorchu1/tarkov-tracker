import { Router } from "express";
import * as ctl from "../controllers/trader.controller.js";

const r = Router();

r.get("/", ctl.getTraders);

r.get("/:traderId/items", ctl.getTraderItemsById);

r.get("/:traderId/barters", ctl.getTraderBartersById);

export default r;
