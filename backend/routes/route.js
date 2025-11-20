import express from 'express';
import { get } from 'mongoose';
const router = express.Router();

router.get("/",getproducts);

router.post("",createproduct);

router.put("/:id",updateproduct);

router.delete("/:id",deleteproduct);
export default router;
